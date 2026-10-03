/**
 * A tokeniser and a recursive-descent parser for one statement.
 *
 * ── WHY NOT A PARSER GENERATOR, AND WHY NOT A LIBRARY ─────────────────────
 *
 * The grammar below is about forty productions and it is fixed — this
 * accepts one statement shape and will never accept joins, subqueries or
 * window functions, because the engine behind it cannot execute them.
 * A full SQL parser would accept all three and then fail at execution with
 * a message about an internal node type, which is a worse experience than
 * being told at the caret that the word is not understood here.
 *
 * Charter 03 §I. What is already here — a loop and a switch — can do this.
 *
 * ⚠ EVERY ERROR CARRIES A CHARACTER OFFSET.
 *
 *   A parser that reports "syntax error" has not finished the job. The
 *   offset is what lets the editor underline the word, and underlining the
 *   word is the difference between a query language somebody will use and
 *   one they will abandon on the second attempt.
 */

export class SqlError extends Error {
  readonly at: number;
  readonly length: number;
  constructor(message: string, at: number, length = 1) {
    super(message);
    this.name = "SqlError";
    this.at = at;
    this.length = length;
  }
}

// ── Tokens ───────────────────────────────────────────────────────────────

export type Tok = {
  kind: "ident" | "number" | "string" | "punct" | "eof";
  text: string;
  /** Upper-cased, for keyword comparison without allocating in the parser. */
  upper: string;
  at: number;
};

const PUNCT = ["<=", ">=", "!=", "<>", "(", ")", ",", "*", "+", "-", "/", "=", "<", ">", "."];

export const lex = (sql: string): Tok[] => {
  const out: Tok[] = [];
  let i = 0;

  while (i < sql.length) {
    const ch = sql[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (ch === "-" && sql[i + 1] === "-") {
      while (i < sql.length && sql[i] !== "\n") i += 1;
      continue;
    }

    if (ch === "'" || ch === '"') {
      const quote = ch;
      const start = i;
      i += 1;
      let text = "";
      while (i < sql.length && sql[i] !== quote) {
        // Doubled quote is the SQL escape. A backslash is not, and
        // pretending it is would make 'C:\path\' parse differently here
        // than in the database this syntax is borrowed from.
        if (sql[i] === quote && sql[i + 1] === quote) {
          text += quote;
          i += 2;
          continue;
        }
        text += sql[i];
        i += 1;
      }
      if (i >= sql.length) throw new SqlError("This quote is never closed.", start, 1);
      i += 1;
      out.push({ kind: "string", text, upper: text.toUpperCase(), at: start });
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(sql[i + 1] ?? ""))) {
      const start = i;
      while (i < sql.length && /[0-9._]/.test(sql[i])) i += 1;
      const text = sql.slice(start, i).replace(/_/g, "");
      out.push({ kind: "number", text, upper: text, at: start });
      continue;
    }

    if (/[A-Za-z_]/.test(ch)) {
      const start = i;
      while (i < sql.length && /[A-Za-z0-9_]/.test(sql[i])) i += 1;
      const text = sql.slice(start, i);
      out.push({ kind: "ident", text, upper: text.toUpperCase(), at: start });
      continue;
    }

    const punct = PUNCT.find((p) => sql.startsWith(p, i));
    if (punct) {
      out.push({ kind: "punct", text: punct, upper: punct, at: i });
      i += punct.length;
      continue;
    }

    throw new SqlError(`“${ch}” does not mean anything here.`, i, 1);
  }

  out.push({ kind: "eof", text: "", upper: "", at: sql.length });
  return out;
};

// ── Syntax tree ──────────────────────────────────────────────────────────

export type Agg = "count" | "sum" | "avg" | "min" | "max";

export type Expr =
  | { t: "col"; name: string; at: number }
  | { t: "num"; value: number }
  | { t: "str"; value: string }
  | { t: "bin"; op: string; left: Expr; right: Expr; at: number }
  | { t: "not"; expr: Expr }
  | { t: "neg"; expr: Expr }
  | { t: "in"; left: Expr; values: (string | number)[]; at: number }
  | { t: "like"; left: Expr; pattern: string; at: number }
  | { t: "agg"; fn: Agg; arg: Expr | null; at: number };

export type Item = { expr: Expr; alias: string };

export type Query = {
  items: Item[];
  star: boolean;
  from: string;
  fromAt: number;
  where: Expr | null;
  groupBy: { name: string; at: number }[];
  orderBy: { name: string; desc: boolean; at: number }[];
  limit: number;
};

const AGGS = new Set(["COUNT", "SUM", "AVG", "MIN", "MAX"]);

class Parser {
  private i = 0;
  private readonly toks: Tok[];

  // Written out rather than as a constructor parameter property. The
  // shorthand emits code, so a file using it cannot be read by a runtime
  // that only strips types — which is how the engine is exercised outside
  // the browser.
  constructor(toks: Tok[]) {
    this.toks = toks;
  }

  private peek(): Tok {
    return this.toks[this.i];
  }
  private next(): Tok {
    return this.toks[this.i++];
  }
  private isWord(word: string): boolean {
    const t = this.peek();
    return t.kind === "ident" && t.upper === word;
  }
  private isPunct(p: string): boolean {
    const t = this.peek();
    return t.kind === "punct" && t.text === p;
  }
  private eatWord(word: string): boolean {
    if (!this.isWord(word)) return false;
    this.i += 1;
    return true;
  }
  private eatPunct(p: string): boolean {
    if (!this.isPunct(p)) return false;
    this.i += 1;
    return true;
  }
  private expectWord(word: string) {
    if (!this.eatWord(word)) {
      const t = this.peek();
      throw new SqlError(`Expected ${word} here.`, t.at, Math.max(1, t.text.length));
    }
  }
  private expectPunct(p: string) {
    if (!this.eatPunct(p)) {
      const t = this.peek();
      throw new SqlError(`Expected “${p}” here.`, t.at, Math.max(1, t.text.length));
    }
  }

  parse(): Query {
    this.expectWord("SELECT");

    const items: Item[] = [];
    let star = false;

    if (this.eatPunct("*")) {
      star = true;
    } else {
      do {
        const expr = this.expr();
        let alias = defaultAlias(expr);
        if (this.eatWord("AS")) {
          const t = this.next();
          if (t.kind !== "ident") throw new SqlError("A name was expected after AS.", t.at);
          alias = t.text;
        }
        items.push({ expr, alias });
      } while (this.eatPunct(","));
    }

    this.expectWord("FROM");
    const fromTok = this.next();
    if (fromTok.kind !== "ident") {
      throw new SqlError("A table name was expected after FROM.", fromTok.at);
    }

    const where = this.eatWord("WHERE") ? this.expr() : null;

    const groupBy: { name: string; at: number }[] = [];
    if (this.eatWord("GROUP")) {
      this.expectWord("BY");
      do {
        const t = this.next();
        if (t.kind !== "ident") throw new SqlError("A column was expected here.", t.at);
        groupBy.push({ name: t.text, at: t.at });
      } while (this.eatPunct(","));
    }

    const orderBy: { name: string; desc: boolean; at: number }[] = [];
    if (this.eatWord("ORDER")) {
      this.expectWord("BY");
      do {
        const t = this.next();
        if (t.kind !== "ident") throw new SqlError("A column was expected here.", t.at);
        const desc = this.eatWord("DESC");
        if (!desc) this.eatWord("ASC");
        orderBy.push({ name: t.text, desc, at: t.at });
      } while (this.eatPunct(","));
    }

    let limit = 200;
    if (this.eatWord("LIMIT")) {
      const t = this.next();
      if (t.kind !== "number") throw new SqlError("A number was expected after LIMIT.", t.at);
      limit = Number(t.text);
    }

    const end = this.peek();
    if (end.kind !== "eof") {
      throw new SqlError(
        `“${end.text}” is past the end of the statement.`,
        end.at,
        Math.max(1, end.text.length),
      );
    }

    return { items, star, from: fromTok.text, fromAt: fromTok.at, where, groupBy, orderBy, limit };
  }

  private expr(): Expr {
    return this.or();
  }

  private or(): Expr {
    let left = this.and();
    while (this.isWord("OR")) {
      const at = this.next().at;
      left = { t: "bin", op: "or", left, right: this.and(), at };
    }
    return left;
  }

  private and(): Expr {
    let left = this.unary();
    while (this.isWord("AND")) {
      const at = this.next().at;
      left = { t: "bin", op: "and", left, right: this.unary(), at };
    }
    return left;
  }

  private unary(): Expr {
    if (this.eatWord("NOT")) return { t: "not", expr: this.unary() };
    return this.comparison();
  }

  private comparison(): Expr {
    const left = this.additive();

    if (this.isWord("IN")) {
      const at = this.next().at;
      this.expectPunct("(");
      const values: (string | number)[] = [];
      do {
        const t = this.next();
        if (t.kind === "string") values.push(t.text);
        else if (t.kind === "number") values.push(Number(t.text));
        else throw new SqlError("IN takes a list of literals.", t.at);
      } while (this.eatPunct(","));
      this.expectPunct(")");
      return { t: "in", left, values, at };
    }

    if (this.isWord("LIKE")) {
      const at = this.next().at;
      const t = this.next();
      if (t.kind !== "string") throw new SqlError("LIKE takes a quoted pattern.", t.at);
      return { t: "like", left, pattern: t.text, at };
    }

    for (const op of ["<=", ">=", "!=", "<>", "=", "<", ">"]) {
      if (this.isPunct(op)) {
        const at = this.next().at;
        return { t: "bin", op: op === "<>" ? "!=" : op, left, right: this.additive(), at };
      }
    }

    return left;
  }

  private additive(): Expr {
    let left = this.multiplicative();
    while (this.isPunct("+") || this.isPunct("-")) {
      const tok = this.next();
      left = { t: "bin", op: tok.text, left, right: this.multiplicative(), at: tok.at };
    }
    return left;
  }

  private multiplicative(): Expr {
    let left = this.primary();
    while (this.isPunct("*") || this.isPunct("/")) {
      const tok = this.next();
      left = { t: "bin", op: tok.text, left, right: this.primary(), at: tok.at };
    }
    return left;
  }

  private primary(): Expr {
    const t = this.next();

    if (t.kind === "number") return { t: "num", value: Number(t.text) };
    if (t.kind === "string") return { t: "str", value: t.text };

    if (t.kind === "punct" && t.text === "-") return { t: "neg", expr: this.primary() };

    if (t.kind === "punct" && t.text === "(") {
      const inner = this.expr();
      this.expectPunct(")");
      return inner;
    }

    if (t.kind === "ident") {
      if (AGGS.has(t.upper) && this.isPunct("(")) {
        this.i += 1;
        if (t.upper === "COUNT" && this.eatPunct("*")) {
          this.expectPunct(")");
          return { t: "agg", fn: "count", arg: null, at: t.at };
        }
        const arg = this.expr();
        this.expectPunct(")");
        return { t: "agg", fn: t.upper.toLowerCase() as Agg, arg, at: t.at };
      }
      return { t: "col", name: t.text, at: t.at };
    }

    throw new SqlError(
      t.kind === "eof" ? "The statement stops here, mid-expression." : `“${t.text}” was not expected here.`,
      t.at,
      Math.max(1, t.text.length),
    );
  }
}

const defaultAlias = (expr: Expr): string => {
  switch (expr.t) {
    case "col":
      return expr.name;
    case "agg":
      return expr.arg && expr.arg.t === "col" ? `${expr.fn}_${expr.arg.name}` : expr.fn;
    default:
      return "expr";
  }
};

export const parse = (sql: string): Query => new Parser(lex(sql)).parse();

/** Does this projection make the query an aggregation? */
export const hasAggregate = (expr: Expr): boolean => {
  switch (expr.t) {
    case "agg":
      return true;
    case "bin":
      return hasAggregate(expr.left) || hasAggregate(expr.right);
    case "not":
    case "neg":
      return hasAggregate(expr.expr);
    case "in":
    case "like":
      return hasAggregate(expr.left);
    default:
      return false;
  }
};

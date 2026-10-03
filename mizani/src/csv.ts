/**
 * A CSV reader, because `split(",")` is not one.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * THE FOUR THINGS A SPLIT GETS WRONG, IN THE ORDER THEY BITE
 *
 *   1. A quoted field containing a comma.      "Nakuru, Kiamunyi"
 *   2. A doubled quote inside a quoted field.  "15"" monitor"
 *   3. A newline inside a quoted field.        a product description
 *   4. A trailing CR from a file written on Windows.
 *
 * Every one of these produces a file that imports *almost* correctly. The
 * row count is right, the columns are shifted on the eleven rows that
 * happened to contain a comma, and the error surfaces three weeks later as
 * a total that is out by a few thousand shillings.
 *
 * That is why this is a state machine over characters rather than four
 * regular expressions in a row, and why it is in the repository rather than
 * in `package.json`. Charter 03 §I — it is sixty lines and it is RFC 4180.
 * ══════════════════════════════════════════════════════════════════════════
 */

export const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let i = 0;

  // A trailing newline is not an empty final row, and a leading BOM is not
  // part of the first column's name. Both are what a spreadsheet writes.
  if (text.charCodeAt(0) === 0xfeff) i = 1;

  const endField = () => {
    row.push(field);
    field = "";
  };
  const endRow = () => {
    endField();
    // A line that is genuinely empty is skipped; a line of empty fields is
    // not, because that is a real row in a file with sparse columns.
    if (!(row.length === 1 && row[0] === "")) rows.push(row);
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        quoted = false;
        i += 1;
        continue;
      }
      field += ch;
      i += 1;
      continue;
    }

    if (ch === '"' && field === "") {
      quoted = true;
      i += 1;
      continue;
    }
    if (ch === ",") {
      endField();
      i += 1;
      continue;
    }
    if (ch === "\r") {
      // Swallowed whether or not an LF follows, so a lone CR file still
      // parses and a CRLF file does not grow an invisible character on the
      // end of every last column.
      if (text[i + 1] === "\n") i += 1;
      endRow();
      i += 1;
      continue;
    }
    if (ch === "\n") {
      endRow();
      i += 1;
      continue;
    }

    field += ch;
    i += 1;
  }

  if (field !== "" || row.length > 0) endRow();
  return rows;
};

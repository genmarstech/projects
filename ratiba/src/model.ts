/**
 * A week of cover at a 24-hour pharmacy, as a constraint satisfaction problem.
 *
 * ── THE SHAPE OF THE PROBLEM, AND WHY IT IS NOT A SPREADSHEET ─────────────
 *
 * Twenty-one shifts over seven days, each needing two or three people in
 * named roles, drawn from nine staff who have contracts, qualifications,
 * leave and a legal right to rest. That is 48 decisions over a domain of
 * nine, which is 9^48 arrangements if nothing constrained anything.
 *
 * Almost all of them are illegal, and the interesting part is that the
 * illegality is *relational*: whether Achieng can take Tuesday morning
 * depends on whether she took Monday night, which depends on who else could
 * have. A rota built greedily, row by row — which is how a spreadsheet
 * builds one — paints itself into a corner on Friday and the person holding
 * the pen unpicks Monday by hand.
 *
 * So the constraints are declared, and `solver.ts` searches. The valuable
 * output when no rota exists is not "no solution found"; it is which shift
 * could not be filled and which rule removed each candidate from it.
 */

export type RoleId = "pharmacist" | "technician" | "assistant";

export const ROLES: Record<RoleId, { name: string; short: string }> = {
  pharmacist: { name: "Pharmacist", short: "Ph" },
  technician: { name: "Pharmacy technician", short: "Tc" },
  assistant: { name: "Counter assistant", short: "As" },
};

export type ShiftId = "morning" | "evening" | "night";

export type ShiftTemplate = {
  id: ShiftId;
  name: string;
  short: string;
  /** Hours from midnight. `end` may exceed 24 — a night shift crosses over. */
  start: number;
  end: number;
  /** How many of each role this shift needs. */
  needs: Partial<Record<RoleId, number>>;
};

export const SHIFTS: ShiftTemplate[] = [
  {
    id: "morning",
    name: "Morning",
    short: "M",
    start: 7,
    end: 15,
    needs: { pharmacist: 1, technician: 1, assistant: 1 },
  },
  {
    id: "evening",
    name: "Evening",
    short: "E",
    start: 14,
    end: 22,
    needs: { pharmacist: 1, technician: 1, assistant: 1 },
  },
  {
    id: "night",
    name: "Night",
    short: "N",
    start: 21,
    end: 31,
    needs: { pharmacist: 1, assistant: 1 },
  },
];

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type Day = number; // 0..6

export const hoursOf = (shift: ShiftTemplate) => shift.end - shift.start;

/**
 * A role, in a sentence.
 *
 * The ids are machine words and the messages are read by a branch manager.
 * "has no assistant who can work it" is wrong twice over: the role is
 * called a counter assistant, and the article is "a". Both failures are
 * the kind that make a generated explanation read as generated.
 */
export const roleWord = (role: RoleId, n = 1): string =>
  n === 1 ? ROLES[role].name.toLowerCase() : `${ROLES[role].name.toLowerCase()}s`;

export type Staff = {
  id: string;
  name: string;
  role: RoleId;
  /** Contracted hours a week. The soft cost pulls towards this. */
  contract: number;
  /**
   * ⚠ A HARD CEILING, SEPARATE FROM THE CONTRACT.
   *
   *   The contract is what somebody is paid for and the solver treats
   *   missing it as a cost. This is what they may not exceed, and the
   *   solver treats exceeding it as impossible. Collapsing the two into one
   *   number means either paying for hours nobody worked or rostering hours
   *   nobody may work, and which of those you get depends on which way the
   *   comparison happened to be written.
   */
  maxHours: number;
  /** Day indices this person cannot work at all. */
  unavailable: Day[];
  /** Shifts this person would rather have. Soft, and only soft. */
  prefers: ShiftId[];
};

/** One person-shaped hole in the week. */
export type Slot = {
  /** Stable, and used as a map key everywhere. */
  id: string;
  day: Day;
  shift: ShiftId;
  role: RoleId;
  /** Second assistant on a Saturday is index 1. */
  index: number;
};

export type Rules = {
  /** Hours that must separate the end of one shift and the start of the next. */
  restHours: number;
  /** Longest run of worked days. */
  maxConsecutive: number;
  /** Nights one person may work in the week. */
  maxNights: number;
  /** Enforce the contracted ceiling in `Staff.maxHours`. */
  enforceMaxHours: boolean;
};

export const DEFAULT_RULES: Rules = {
  // Eleven is the daily rest period in the Employment Act's working-time
  // rules, and it is the constraint that makes the problem hard: it turns a
  // per-day choice into a chain down the week.
  restHours: 11,
  maxConsecutive: 6,
  maxNights: 3,
  enforceMaxHours: true,
};

export type Assignment = Record<string, string | null>;

export const SHIFT_BY_ID = new Map(SHIFTS.map((s) => [s.id, s]));

export const shift = (id: ShiftId): ShiftTemplate => {
  const s = SHIFT_BY_ID.get(id);
  if (!s) throw new Error(`No shift ${id}`);
  return s;
};

/**
 * Hours of rest between a shift on `dayA` and one on the following day.
 *
 * A night runs 21:00 to 07:00, so its end is 31 on the previous day's
 * clock. The next morning starts at 07:00 + 24 = 31. Zero rest, and the
 * arithmetic says so without a special case.
 */
export const restBetween = (a: ShiftId, b: ShiftId, dayGap: number): number =>
  shift(b).start + dayGap * 24 - shift(a).end;

import type { ReactNode } from "react";

import { Empty } from "./Feedback";

/**
 * A table, with the four things tables get wrong.
 *
 *   1. **No caption.** A screen reader meeting a table announces its
 *      caption first. Without one it announces "table, six columns" and
 *      the listener has to read a header row to learn what it is of.
 *   2. **Numbers in proportional figures.** A column of amounts that does
 *      not line up at the decimal point is a column nobody can compare
 *      down. `align: "num"` sets `tabular-nums` and right-alignment
 *      together, because one without the other is still wrong.
 *   3. **An empty body.** A header row over nothing reads as a broken
 *      screen. `empty` is required, not optional.
 *   4. **A sticky header that is not sticky.** `position: sticky` needs a
 *      scroll container, and the container here is the wrapper — never the
 *      page, which would scroll the whole document sideways on a wide
 *      table.
 */

export type ColumnSpec<Row> = {
  key: string;
  header: string;
  align?: "text" | "num";
  width?: string;
  render: (row: Row) => ReactNode;
};

export const DataTable = <Row,>({
  caption,
  columns,
  rows,
  rowKey,
  empty,
}: {
  caption: string;
  columns: ColumnSpec<Row>[];
  rows: Row[];
  rowKey: (row: Row, i: number) => string;
  empty: ReactNode;
}) => {
  if (rows.length === 0) {
    return typeof empty === "string" ? <Empty title={empty} /> : <>{empty}</>;
  }

  return (
    <div className="k-table__wrap">
      <table className="k-table">
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={c.align === "num" ? "k-num" : undefined}
                style={c.width ? { width: c.width } : undefined}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map((c) => (
                <td key={c.key} className={c.align === "num" ? "k-num" : undefined}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

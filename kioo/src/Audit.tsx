import { useEffect, useRef, useState } from "react";

import { type Reading, measure } from "./audit";

/**
 * Both palettes, measured in one document.
 *
 * The two scopes below carry `data-theme`, so each inherits a complete
 * token set regardless of which theme the reader is in. That is the reason
 * the token layer assigns every dark value twice — once in the media query
 * for the un-stamped default, once under the attribute — and this page is
 * what the second assignment is for.
 */

const Readings = ({ rows }: { rows: Reading[] }) => (
  <table className="k-table audit__table">
    <caption className="visually-hidden">Measured contrast ratios</caption>
    <thead>
      <tr>
        <th scope="col">Pair</th>
        <th scope="col">Used for</th>
        <th scope="col">Colours</th>
        <th scope="col" className="k-num">Ratio</th>
        <th scope="col" className="k-num">Needs</th>
        <th scope="col">Verdict</th>
      </tr>
    </thead>
    <tbody>
      {rows.map((r) => (
        <tr key={r.label}>
          <td className="audit__pair">{r.label}</td>
          <td className="audit__use">{r.use}</td>
          <td>
            <span className="audit__swatch" style={{ background: r.bgHex, color: r.fgHex }}>
              Aa
            </span>
            <span className="audit__hex">
              {r.fgHex} on {r.bgHex}
            </span>
          </td>
          <td className="k-num audit__ratio">{r.ratio.toFixed(2)}</td>
          <td className="k-num audit__need">{r.need}</td>
          <td>
            <span className={`k-chip k-chip--${r.pass ? "good" : "bad"}`}>
              {r.pass ? "passes" : "fails"}
            </span>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export const Audit = () => {
  const lightRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState<Reading[]>([]);
  const [dark, setDark] = useState<Reading[]>([]);

  useEffect(() => {
    // One pass, after the fonts and the stylesheet are in. The tokens are
    // static, so re-measuring on every render would burn layout for an
    // answer that cannot have changed.
    if (lightRef.current) setLight(measure(lightRef.current));
    if (darkRef.current) setDark(measure(darkRef.current));
  }, []);

  const failures = [...light, ...dark].filter((r) => !r.pass).length;

  return (
    <section className="audit">
      <p className="k-lede">
        Thirty measurements, taken when this page loaded, from probe
        elements given <code>color: var(--token)</code> inside a scope
        carrying each theme. Not a table anybody maintains — change a token
        and this changes with it.
      </p>

      <p className={`audit__verdict${failures === 0 ? " is-good" : " is-bad"}`}>
        {failures === 0
          ? `All ${light.length + dark.length} pairs meet WCAG 2.2 AA in both themes.`
          : `${failures} of ${light.length + dark.length} pairs are below the line.`}
      </p>

      <div ref={lightRef} data-theme="light" className="audit__scope">
        <h3>Light</h3>
        <Readings rows={light} />
      </div>

      <div ref={darkRef} data-theme="dark" className="audit__scope">
        <h3>Dark</h3>
        <Readings rows={dark} />
      </div>
    </section>
  );
};

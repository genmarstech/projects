import { useId, useRef, useState } from "react";
import type { ReactNode } from "react";

/**
 * Tabs that a keyboard can actually use.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * A TAB STRIP IS NOT A ROW OF BUTTONS, AND THE DIFFERENCE IS THE TAB KEY.
 *
 * Five buttons mean five stops on the way past. The pattern assistive
 * technology expects — and the one sighted keyboard users expect too — is
 * ONE stop for the whole strip, with the arrow keys moving between tabs
 * inside it. That is a roving tabindex: the selected tab has `tabIndex 0`
 * and every other has `-1`.
 *
 * Getting this wrong is invisible to anybody using a mouse, which is why
 * it survives in so many component libraries.
 * ══════════════════════════════════════════════════════════════════════════
 *
 * Home and End are included because they cost two lines and a strip of
 * eight tabs is tedious without them.
 */

export type Tab = { id: string; label: string; panel: ReactNode };

export const Tabs = ({ tabs, label }: { tabs: Tab[]; label: string }) => {
  const [active, setActive] = useState(tabs[0]?.id);
  const base = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const move = (to: number) => {
    const next = tabs[(to + tabs.length) % tabs.length];
    if (!next) return;
    setActive(next.id);
    // Selection follows focus, which is correct when switching is cheap —
    // and these panels are already rendered. Where a tab triggers a
    // network request, it should not, and this component would need a
    // `manual` mode rather than a comment saying so.
    refs.current[next.id]?.focus();
  };

  const at = tabs.findIndex((t) => t.id === active);

  return (
    <div className="k-tabs">
      <div className="k-tabs__strip" role="tablist" aria-label={label}>
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[tab.id] = node;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${tab.id}`}
            aria-selected={tab.id === active}
            aria-controls={`${base}-panel-${tab.id}`}
            tabIndex={tab.id === active ? 0 : -1}
            className={`k-tabs__tab${tab.id === active ? " is-on" : ""}`}
            onClick={() => setActive(tab.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") { e.preventDefault(); move(i + 1); }
              else if (e.key === "ArrowLeft") { e.preventDefault(); move(i - 1); }
              else if (e.key === "Home") { e.preventDefault(); move(0); }
              else if (e.key === "End") { e.preventDefault(); move(tabs.length - 1); }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`${base}-panel-${tab.id}`}
          aria-labelledby={`${base}-tab-${tab.id}`}
          hidden={tab.id !== active}
          /* A panel is a landing place for focus moved from its tab, so it
             takes a tab stop of its own. Without it, Tab from the strip
             jumps past the content the strip was selecting. */
          tabIndex={0}
          className="k-tabs__panel"
        >
          {tab.panel}
        </div>
      ))}

      <span className="visually-hidden" aria-live="polite">
        {tabs[at]?.label} selected
      </span>
    </div>
  );
};

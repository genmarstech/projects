import { c, ease, font, r, revealFrom } from "../theme";
import { BY, RECIPE, RECIPE_IMG, money, photo } from "../data";
import type { StoreApi } from "../useStore";
import type { ScrollRefs } from "../useScrollFx";

/**
 * Six ingredients, one button.
 *
 * The total is summed from the catalogue rather than written down, so it
 * cannot disagree with what the button actually puts in the basket.
 */
export function RecipeBundle({ s, refs }: { s: StoreApi; refs: ScrollRefs }) {
  const items = RECIPE.flatMap((id) => (BY[id] ? [BY[id]] : []));
  const total = items.reduce((a, p) => a + p.price, 0);

  return (
    <section ref={refs.recipe} style={{ background: c.forest, color: c.cream, overflow: "hidden" }}>
      <div
        style={{
          maxWidth: 1440,
          margin: "0 auto",
          padding: "clamp(64px,8vw,120px) clamp(16px,3vw,40px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
          gap: "clamp(36px,6vw,96px)",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "relative",
            aspectRatio: "4/5",
            borderRadius: 32,
            overflow: "hidden",
          }}
        >
          {/* Oversized top and height so the parallax has somewhere to travel
              without exposing the frame's edge. */}
          <img
            ref={refs.recipeImg}
            src={photo(RECIPE_IMG, 1100)}
            alt="A bowl of spinach, avocado, jammy eggs and charred sourdough"
            loading="lazy"
            style={{
              position: "absolute",
              left: 0,
              top: "-10%",
              width: "100%",
              height: "120%",
              objectFit: "cover",
              willChange: "transform",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 18,
              top: 18,
              background: c.tomato,
              color: c.onTomato,
              padding: "8px 12px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".14em",
              textTransform: "uppercase",
            }}
          >
            Recipe · 25 min
          </div>
        </div>

        <div
          data-reveal="0ms"
          style={{ ...revealFrom, display: "flex", flexDirection: "column", gap: 28 }}
        >
          <span style={{ fontFamily: font.word, fontStyle: "italic", fontSize: 28, color: c.amber }}>
            Cook tonight
          </span>
          <h2
            style={{
              margin: 0,
              fontFamily: font.display,
              fontWeight: 400,
              textTransform: "uppercase",
              fontSize: "clamp(52px,7vw,112px)",
              lineHeight: 0.88,
            }}
          >
            The Sunday <span style={{ display: "block", color: c.amber }}>green bowl</span>
          </h2>
          <p
            style={{
              margin: 0,
              maxWidth: 480,
              fontSize: 17,
              lineHeight: 1.6,
              color: c.onDark,
              textWrap: "pretty",
            }}
          >
            Crisp spinach, jammy eggs, charred sourdough and ripe avocado. Every ingredient,
            measured for four, lands in your basket in one tap.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid rgba(244,238,225,.2)",
            }}
          >
            {items.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderBottom: "1px solid rgba(244,238,225,.2)",
                }}
              >
                <img
                  src={photo(p.img, 120)}
                  alt=""
                  loading="lazy"
                  style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover" }}
                />
                <span style={{ flex: 1, fontWeight: 700, fontSize: 15 }}>{p.name}</span>
                <span style={{ fontSize: 14, color: c.onForestSoft }}>{money(p.price)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="lift"
              onClick={s.addRecipe}
              style={{
                height: 58,
                padding: "0 28px",
                borderRadius: r.pill,
                border: 0,
                background: c.amber,
                color: c.ink,
                fontWeight: 800,
                fontSize: 15,
                cursor: "pointer",
                transition: `transform .25s ${ease.travel}`,
              }}
            >
              Add all ingredients · {money(total)}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

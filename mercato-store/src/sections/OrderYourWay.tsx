import { c, font, r, revealFrom } from "../theme";
import { photo } from "../data";
import { SectionHeading } from "../components/ui";
import type { StoreApi } from "../useStore";

export function OrderYourWay({ s }: { s: StoreApi }) {
  const ways = [
    {
      tag: "From 2 hours",
      title: "Home delivery",
      desc: "Choose a two-hour window, seven days a week. Chilled goods travel in insulated bags.",
      img: "1542838132-92c53300491e",
      cta: "Book a slot",
      go: () => {
        s.setMode("Delivery");
        s.go("checkout");
      },
    },
    {
      tag: "Always free",
      title: "Click & collect",
      desc: "Order by noon, collect from any of our three stores within the hour.",
      img: "1606787366850-de6330128bfc",
      cta: "Choose a store",
      go: () => {
        s.setMode("Pickup");
        s.go("checkout");
      },
    },
    {
      tag: "Save 5%",
      title: "Weekly staples",
      desc: "Set your milk, eggs and bread on repeat. Skip, swap or pause any week.",
      img: "1488459716781-31db52582fe9",
      cta: "Build my list",
      go: () => s.goShop("Dairy", true),
    },
  ];

  return (
    <section
      style={{
        maxWidth: 1440,
        margin: "0 auto",
        padding: "clamp(64px,8vw,120px) clamp(16px,3vw,40px)",
      }}
    >
      <div data-reveal="0ms" style={{ ...revealFrom, marginBottom: 40 }}>
        <SectionHeading before="Shop" accent="your way" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 20,
        }}
      >
        {ways.map((w, i) => (
          <article
            key={w.title}
            data-reveal={`${i * 90}ms`}
            style={{
              ...revealFrom,
              position: "relative",
              borderRadius: r.tile,
              overflow: "hidden",
              minHeight: 460,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              color: c.cream,
            }}
          >
            <img
              src={photo(w.img, 900)}
              alt=""
              loading="lazy"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg,rgba(14,30,24,0) 30%,rgba(14,30,24,.92) 100%)",
              }}
            />
            <div
              style={{
                position: "relative",
                padding: 28,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <span
                style={{
                  alignSelf: "flex-start",
                  background: c.cream,
                  color: c.ink,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: ".1em",
                  textTransform: "uppercase",
                  padding: "6px 10px",
                  borderRadius: 6,
                }}
              >
                {w.tag}
              </span>
              <h3
                style={{
                  margin: 0,
                  fontFamily: font.display,
                  fontWeight: 400,
                  fontSize: 44,
                  lineHeight: 0.95,
                  textTransform: "uppercase",
                }}
              >
                {w.title}
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: c.onDark,
                  maxWidth: 340,
                }}
              >
                {w.desc}
              </p>
              <button
                type="button"
                onClick={w.go}
                style={{
                  alignSelf: "flex-start",
                  marginTop: 6,
                  height: 46,
                  padding: "0 20px",
                  borderRadius: r.pill,
                  border: 0,
                  background: c.amber,
                  color: c.ink,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                {w.cta}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

import { useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { ImageSlot } from "./ImageSlot";
import {
  CAUSES,
  CONCERNS,
  FAQS,
  PRODUCTS,
  RESULTS,
  REVIEWS,
  STYLES,
  STYLE_TIP,
  WHATSAPP_NUMBER,
  fmt,
  type Concern,
  type HairStyle,
} from "./data";

/**
 * DeeWee Natural Oils — implemented from the Claude Design handoff
 * (`DeeWee Website.dc.html`). The original is written against a
 * design-tool-specific runtime (`<x-dc>`, `sc-if`/`sc-for`, `{{ }}`
 * bindings, a `DCLogic` base class) that only exists inside the Claude
 * Design editor. This is the same page, same copy, same state machine,
 * as a real React site — see the component's own `renderVals()` in the
 * source export, which this file follows section for section.
 *
 * Two toggles the editor exposed as switches are fixed here rather than
 * wired to any UI, because there is nobody to show that UI to on a
 * deployed site:
 *   - `showAnnouncement` / `reviewTranslations` — left on, matching the
 *     design's own defaults.
 *   - `showConceptBadge` — also left on, since this is still presented as
 *     a concept. Flip SHOW_CONCEPT_BADGE below to false once that changes.
 */
const SHOW_ANNOUNCEMENT = true;
const SHOW_CONCEPT_BADGE = true;
const SHOW_REVIEW_TRANSLATIONS = true;

const INK = "#15110b";
const PAPER = "#f6efe2";
const GOLD = "#f0c24b";
const GREEN = "#2f5d34";
const MUTED = "#c9bba3";
const BODY_MUTED = "#d9ccb6";

export function App() {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [concern, setConcern] = useState<Concern["id"] | null>(null);
  const [style, setStyle] = useState<HairStyle["id"] | null>(null);
  const [faqOpen, setFaqOpen] = useState(0);
  const [slider, setSlider] = useState(50);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function add(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
    const name = PRODUCTS.find((p) => p.id === id)?.name ?? "Item";
    setToast(`${name} added`);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }

  function setQty(id: string, d: number) {
    setCart((c) => {
      const next = { ...c };
      next[id] = (next[id] ?? 0) + d;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }

  const items = useMemo(
    () =>
      PRODUCTS.filter((p) => cart[p.id]).map((p) => ({
        ...p,
        qty: cart[p.id],
        lineLabel: `${cart[p.id]} × ${p.priceLabel}`,
      })),
    [cart],
  );
  const total = items.reduce((a, i) => a + i.price * i.qty, 0);
  const count = items.reduce((a, i) => a + i.qty, 0);

  const orderText =
    "Hi DeeWee! I'd like to order:\n" +
    items.map((i) => `${i.qty} × ${i.name} (${fmt(i.price * i.qty)})`).join("\n") +
    `\nTotal: ${fmt(total)}\nPaying via Paybill 400200, Acc 892668.`;
  const waOrder = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText)}`;

  const result = useMemo(() => {
    if (step !== 2 || !concern || !style) return null;
    const r = RESULTS[concern];
    const p = PRODUCTS.find((x) => x.id === r.pid)!;
    const steps = [...r.steps, STYLE_TIP[style]];
    const c = CONCERNS.find((x) => x.id === concern)!.label.toLowerCase();
    const st = STYLES.find((x) => x.id === style)!.label.toLowerCase();
    return {
      headline: r.headline,
      product: p,
      steps,
      wa: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
        `Hi DeeWee! I took the hair quiz — my concern is ${c} and I wear my hair ${st}. Can you advise?`,
      )}`,
    };
  }, [step, concern, style]);

  return (
    <div style={{ minHeight: "100vh", background: INK, overflowX: "hidden" }}>
      {SHOW_ANNOUNCEMENT ? <AnnouncementBar /> : null}
      <Header cartCount={count} onOpenCart={() => { setCartOpen(true); setToast(null); }} />
      <Hero onAddOil={() => add("oil")} />
      <Marquee />
      <Manifesto />
      <Shop onAdd={add} />
      <Ritual />
      <Quiz
        step={step}
        result={result}
        onPickConcern={(id) => { setConcern(id); setStep(1); }}
        onPickStyle={(id) => { setStyle(id); setStep(2); }}
        onBack={() => setStep(0)}
        onReset={() => { setStep(0); setConcern(null); setStyle(null); }}
        onAddResult={(id) => add(id)}
      />
      <ResultsCompare slider={slider} onSlide={setSlider} />
      <Reviews showTranslations={SHOW_REVIEW_TRANSLATIONS} />
      <FaqSection open={faqOpen} onToggle={(i) => setFaqOpen((cur) => (cur === i ? -1 : i))} />
      <Visit />
      <Community />
      <Footer />
      {SHOW_CONCEPT_BADGE ? <ConceptBadge /> : null}
      {toast && !cartOpen ? <Toast text={toast} onOpenCart={() => { setCartOpen(true); setToast(null); }} /> : null}
      {cartOpen ? (
        <CartDrawer
          items={items}
          count={count}
          totalLabel={fmt(total)}
          waOrder={waOrder}
          onClose={() => setCartOpen(false)}
          onAddOil={() => add("oil")}
          onInc={(id) => setQty(id, 1)}
          onDec={(id) => setQty(id, -1)}
        />
      ) : null}
    </div>
  );
}

// ── announcement bar ─────────────────────────────────────────────────────

function AnnouncementBar() {
  return (
    <div
      style={{
        background: GOLD,
        color: INK,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: ".02em",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "center",
        gap: 10,
        flexWrap: "wrap",
        textAlign: "center",
      }}
    >
      <span>Anniversary offer — Growth Oil now KES 650</span>
      <span style={{ opacity: 0.5 }}>·</span>
      <span>Visit us at Star Mall, 2nd floor, Shop B7</span>
    </div>
  );
}

// ── header ────────────────────────────────────────────────────────────────

function Header({ cartCount, onOpenCart }: { cartCount: number; onOpenCart: () => void }) {
  const navLinks = [
    { href: "#shop", label: "Shop" },
    { href: "#ritual", label: "Ritual" },
    { href: "#quiz", label: "Hair quiz" },
    { href: "#results", label: "Results" },
    { href: "#faq", label: "FAQs" },
    { href: "#visit", label: "Visit" },
  ];
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(21,17,11,.88)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(246,239,226,.08)",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "16px clamp(20px,4vw,48px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        <a href="#top" style={{ display: "flex", alignItems: "baseline", gap: 10, color: PAPER }}>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 32, lineHeight: 1, letterSpacing: "-.01em" }}>
            Dee<span style={{ fontStyle: "italic", color: GOLD }}>Wee</span>
          </span>
          <span style={{ fontSize: 11, letterSpacing: ".18em", textTransform: "uppercase", color: MUTED }}>
            Natural Oils
          </span>
        </a>
        <nav style={{ display: "flex", gap: 28, fontSize: 14, fontWeight: 500, flexWrap: "wrap" }}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="dw-nav-link" style={{ color: PAPER }}>
              {l.label}
            </a>
          ))}
        </nav>
        <button
          onClick={onOpenCart}
          className="dw-fill-btn"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: PAPER,
            color: INK,
            border: 0,
            borderRadius: 999,
            padding: "10px 18px",
            font: "600 14px 'Hanken Grotesk',sans-serif",
            cursor: "pointer",
          }}
        >
          <span>Basket</span>
          <span
            style={{
              minWidth: 22,
              height: 22,
              borderRadius: 999,
              background: INK,
              color: GOLD,
              display: "grid",
              placeItems: "center",
              fontSize: 12,
            }}
          >
            {cartCount}
          </span>
        </button>
      </div>
    </header>
  );
}

// ── hero ──────────────────────────────────────────────────────────────────

function Hero({ onAddOil }: { onAddOil: () => void }) {
  return (
    <section
      id="top"
      style={{
        position: "relative",
        maxWidth: 1280,
        margin: "0 auto",
        padding: "clamp(48px,7vw,96px) clamp(20px,4vw,48px) clamp(56px,7vw,100px)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,460px),1fr))",
        gap: "clamp(40px,5vw,72px)",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: MUTED }}>
          <span style={{ width: 32, height: 1, background: GOLD }} />
          <span>Hand-blended in Nairobi, Kenya</span>
        </div>
        <h1
          style={{
            margin: 0,
            fontFamily: "'Instrument Serif',serif",
            fontWeight: 400,
            fontSize: "clamp(56px,8.4vw,116px)",
            lineHeight: 0.92,
            letterSpacing: "-.025em",
            textWrap: "balance",
          }}
        >
          Healthy hair goals, made <span style={{ fontStyle: "italic", color: GOLD }}>real.</span>
        </h1>
        <p style={{ margin: 0, maxWidth: "30em", fontSize: "clamp(17px,1.4vw,19px)", lineHeight: 1.6, color: BODY_MUTED, textWrap: "pretty" }}>
          100% natural oils for edges that come back, length that stays and a scalp that finally breathes. Loved by
          21,800 Kenyans who stopped blaming their genes.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={onAddOil}
            className="dw-cta-fill"
            style={{
              background: GOLD,
              color: INK,
              border: 0,
              borderRadius: 999,
              padding: "18px 28px",
              font: "700 15px 'Hanken Grotesk',sans-serif",
              cursor: "pointer",
              display: "flex",
              gap: 14,
              alignItems: "center",
            }}
          >
            <span>Add Growth Oil</span>
            <span style={{ fontWeight: 500, opacity: 0.7 }}>KES 650</span>
          </button>
          <a
            href="#quiz"
            className="dw-outline-btn"
            style={{ border: "1px solid rgba(246,239,226,.3)", color: PAPER, borderRadius: 999, padding: "18px 28px", fontWeight: 600, fontSize: 15 }}
          >
            Find my routine — 30 sec
          </a>
        </div>
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", paddingTop: 12, borderTop: "1px solid rgba(246,239,226,.1)", fontSize: 13, color: MUTED }}>
          <span>
            <strong style={{ color: PAPER, fontWeight: 600 }}>Pay via M-Pesa</strong> · Paybill 400200
          </span>
          <span>
            <strong style={{ color: PAPER, fontWeight: 600 }}>Order on WhatsApp</strong> · 0705 472 849
          </span>
        </div>
      </div>

      <div style={{ position: "relative", display: "flex", justifyContent: "center", padding: "20px 0" }}>
        <div
          style={{
            position: "relative",
            width: "min(100%,460px)",
            aspectRatio: "4/5",
            borderRadius: "240px 240px 28px 28px",
            background: PAPER,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", inset: "-10% -30% auto auto", width: "80%", aspectRatio: "1", borderRadius: "50%", background: GOLD, opacity: 0.45 }} />
          <div style={{ position: "absolute", inset: "auto auto -12% -20%", width: "70%", aspectRatio: "1", borderRadius: "50%", background: GREEN, opacity: 0.18 }} />
          <div style={{ position: "absolute", inset: "6% 10% 0", mixBlendMode: "multiply" }}>
            <ImageSlot src="/assets/bottle.png" alt="DeeWee Growth Oil bottle" fit="contain" shape="rect" />
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: "12%",
            maxWidth: 240,
            background: INK,
            border: "1px solid rgba(240,194,75,.35)",
            borderRadius: "18px 18px 18px 4px",
            padding: "16px 18px",
            boxShadow: "0 20px 50px rgba(0,0,0,.4)",
          }}
        >
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 21, lineHeight: 1.2, fontStyle: "italic", color: PAPER }}>
            “Two weeks in and it’s taken me so far.”
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: MUTED }}>Yvette · verified buyer</div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "8%",
            background: GREEN,
            color: PAPER,
            borderRadius: 999,
            padding: "12px 18px",
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            gap: 8,
            alignItems: "center",
            boxShadow: "0 14px 40px rgba(0,0,0,.35)",
          }}
        >
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: GOLD }} />
          <span>100% natural · Made in Kenya</span>
        </div>
      </div>
    </section>
  );
}

// ── marquee ───────────────────────────────────────────────────────────────

const MARQUEE_WORDS = ["Edges back", "Length retained", "Thinning slowed", "Scalp soothed", "Postpartum support", "100% natural", "Made in Kenya"];

function Marquee() {
  const track: CSSProperties = { display: "flex", width: "max-content", animation: "dw-marquee 36s linear infinite" };
  const group: CSSProperties = { display: "flex", gap: 48, paddingRight: 48, alignItems: "center" };
  return (
    <div style={{ borderTop: "1px solid rgba(246,239,226,.1)", borderBottom: "1px solid rgba(246,239,226,.1)", padding: "22px 0", overflow: "hidden", background: "#1b160e" }}>
      <div style={track}>
        {[0, 1].map((k) => (
          <div key={k} style={group}>
            {MARQUEE_WORDS.map((t, i) => (
              <span
                key={i}
                style={{
                  display: "flex",
                  gap: 48,
                  alignItems: "center",
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 30,
                  fontStyle: i % 2 ? "italic" : "normal",
                  color: i % 2 ? GOLD : PAPER,
                  whiteSpace: "nowrap",
                }}
              >
                {t}
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: GREEN, display: "inline-block" }} />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── manifesto ─────────────────────────────────────────────────────────────

function Manifesto() {
  return (
    <section style={{ background: PAPER, color: INK }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(72px,9vw,128px) clamp(20px,4vw,48px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
          gap: "clamp(40px,6vw,96px)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#6b5d48" }}>The DeeWee philosophy</div>
          <h2
            style={{
              margin: 0,
              fontFamily: "'Instrument Serif',serif",
              fontWeight: 400,
              fontSize: "clamp(44px,5.6vw,80px)",
              lineHeight: 0.98,
              letterSpacing: "-.02em",
              textWrap: "balance",
            }}
          >
            Your hairline is speaking. <span style={{ fontStyle: "italic", color: "#9a5d12" }}>Are you listening?</span>
          </h2>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.65, color: "#4a3f2f", maxWidth: "32em", textWrap: "pretty" }}>
            Before blaming genetics, look at the habits. In many cases we are part of the problem — and that means we
            can be part of the fix.
          </p>
          <div style={{ position: "relative", width: "100%", maxWidth: 440, aspectRatio: "4/5", marginTop: 12 }}>
            <ImageSlot
              shape="rounded"
              radius={200}
              src="https://images.unsplash.com/photo-1632765854612-9b02b6ec2b15?auto=format&fit=crop&w=1200&q=80"
              alt="Customer portrait"
              credit="Photo by Good Faces on Unsplash"
              creditHref="https://unsplash.com/@goodfacesagency"
            />
            <div
              style={{
                position: "absolute",
                right: -12,
                top: "14%",
                background: INK,
                color: GOLD,
                borderRadius: 999,
                padding: "12px 18px",
                fontFamily: "'Instrument Serif',serif",
                fontStyle: "italic",
                fontSize: 22,
                pointerEvents: "none",
              }}
            >
              habits before genes
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {CAUSES.map((c) => (
            <div key={c.n} style={{ display: "grid", gridTemplateColumns: "64px 1fr", gap: 20, padding: "28px 0", borderTop: "1px solid rgba(21,17,11,.15)" }}>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 44, lineHeight: 1, color: "#9a5d12", fontStyle: "italic" }}>{c.n}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 21, fontWeight: 600 }}>{c.title}</div>
                <div style={{ fontSize: 16, lineHeight: 1.55, color: "#4a3f2f" }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── shop ──────────────────────────────────────────────────────────────────

function Shop({ onAdd }: { onAdd: (id: string) => void }) {
  return (
    <section id="shop" style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(72px,9vw,128px) clamp(20px,4vw,48px)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, flexWrap: "wrap", marginBottom: 48 }}>
        <h2 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: "clamp(44px,5.6vw,80px)", lineHeight: 0.98, letterSpacing: "-.02em" }}>
          The <span style={{ fontStyle: "italic", color: GOLD }}>ritual</span>, bottled.
        </h2>
        <p style={{ margin: 0, maxWidth: "24em", fontSize: 16, lineHeight: 1.6, color: MUTED }}>
          Small-batch, made in Kenya. Pick up at Star Mall or order on WhatsApp — pay with M-Pesa.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 20 }}>
        {PRODUCTS.map((p) => (
          <article key={p.id} className="dw-card" style={{ display: "flex", flexDirection: "column", background: "#1f1910", border: "1px solid rgba(246,239,226,.08)", borderRadius: 28, overflow: "hidden" }}>
            <div style={{ position: "relative", aspectRatio: "1/1", background: p.bg }}>
              <div style={{ position: "absolute", inset: p.inset, mixBlendMode: p.blend }}>
                <ImageSlot src={p.img} alt={p.name} fit={p.fit} shape="rect" />
              </div>
              <div style={{ position: "absolute", top: 16, left: 16, background: INK, color: GOLD, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 700, padding: "7px 12px", borderRadius: 999 }}>
                {p.tag}
              </div>
            </div>
            <div style={{ padding: "24px 24px 26px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <h3 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: 32, lineHeight: 1.05 }}>{p.name}</h3>
                <div style={{ fontWeight: 600, fontSize: 16, color: GOLD, whiteSpace: "nowrap" }}>{p.priceLabel}</div>
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: MUTED, flex: 1 }}>{p.sub}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {p.tags.map((t) => (
                  <span key={t} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(246,239,226,.16)", color: BODY_MUTED }}>
                    {t}
                  </span>
                ))}
              </div>
              <button
                onClick={() => onAdd(p.id)}
                className="dw-fill-btn"
                style={{ marginTop: 8, background: PAPER, color: INK, border: 0, borderRadius: 999, padding: "15px 20px", font: "700 14px 'Hanken Grotesk',sans-serif", cursor: "pointer" }}
              >
                {p.cta}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// ── ritual ────────────────────────────────────────────────────────────────

const RITUAL_STEPS = [
  { word: "Part", body: "Section clean, dry hair so the scalp is exposed — edges first." },
  { word: "Drip", body: "Use the nozzle to place 3–4 drops straight onto the scalp, not the hair." },
  { word: "Rub", body: "Massage in small circles with your fingertips for two minutes. Sleep on satin." },
];

function Ritual() {
  return (
    <section id="ritual" style={{ background: "#1b160e", borderTop: "1px solid rgba(246,239,226,.08)" }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(72px,9vw,128px) clamp(20px,4vw,48px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
          gap: "clamp(40px,6vw,96px)",
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", aspectRatio: "4/5", width: "100%" }}>
          <ImageSlot
            shape="rounded"
            radius={28}
            src="https://images.unsplash.com/photo-1632765866070-3fadf25d3d5b?auto=format&fit=crop&w=1400&q=80"
            alt="Nightly hair ritual"
            credit="Photo by Good Faces on Unsplash"
            creditHref="https://unsplash.com/@goodfacesagency"
          />
          <div
            style={{
              position: "absolute",
              left: 24,
              top: 24,
              background: GOLD,
              color: INK,
              borderRadius: 999,
              padding: "9px 16px",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".14em",
              textTransform: "uppercase",
              pointerEvents: "none",
            }}
          >
            2 minutes a night
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: MUTED }}>How to use</div>
          <h2 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: "clamp(44px,5.6vw,80px)", lineHeight: 0.98, letterSpacing: "-.02em", textWrap: "balance" }}>
            The nightly <span style={{ fontStyle: "italic", color: GOLD }}>ritual.</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {RITUAL_STEPS.map((s, i) => (
              <div
                key={s.word}
                style={{
                  display: "grid",
                  gridTemplateColumns: "72px 1fr",
                  gap: 20,
                  padding: "24px 0",
                  borderTop: "1px solid rgba(246,239,226,.12)",
                  borderBottom: i === RITUAL_STEPS.length - 1 ? "1px solid rgba(246,239,226,.12)" : undefined,
                }}
              >
                <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 48, lineHeight: 1, color: GOLD, fontStyle: "italic" }}>{s.word}</div>
                <div style={{ fontSize: 16, lineHeight: 1.6, color: BODY_MUTED, paddingLeft: 28 }}>{s.body}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── hair quiz ─────────────────────────────────────────────────────────────

function Quiz({
  step,
  result,
  onPickConcern,
  onPickStyle,
  onBack,
  onReset,
  onAddResult,
}: {
  step: 0 | 1 | 2;
  result: { headline: string; product: (typeof PRODUCTS)[number]; steps: string[]; wa: string } | null;
  onPickConcern: (id: Concern["id"]) => void;
  onPickStyle: (id: HairStyle["id"]) => void;
  onBack: () => void;
  onReset: () => void;
  onAddResult: (id: string) => void;
}) {
  const optionButton: CSSProperties = {
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    padding: 20,
    borderRadius: 20,
    border: "1.5px solid rgba(21,17,11,.14)",
    background: "#fbf7ef",
    color: INK,
    cursor: "pointer",
    fontFamily: "'Hanken Grotesk',sans-serif",
  };

  return (
    <section id="quiz" style={{ background: GREEN }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(72px,9vw,120px) clamp(20px,4vw,48px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
          gap: "clamp(40px,6vw,88px)",
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 20, position: "sticky", top: 110 }}>
          <div style={{ fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: "#d6e3cf" }}>Hair diagnosis · 30 seconds</div>
          <h2 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: "clamp(44px,5.6vw,76px)", lineHeight: 0.98, letterSpacing: "-.02em", textWrap: "balance" }}>
            Tell us what your hair is <span style={{ fontStyle: "italic", color: GOLD }}>saying.</span>
          </h2>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: "#e4ecdf", maxWidth: "28em" }}>
            Two questions. One honest routine — the same advice we give at the counter in Shop B7.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ height: 4, width: 48, borderRadius: 4, background: i <= step ? GOLD : "rgba(246,239,226,.25)" }} />
            ))}
          </div>
          <div style={{ width: "100%", maxWidth: 420, aspectRatio: "4/3", marginTop: 16 }}>
            <ImageSlot
              shape="rounded"
              radius={24}
              src="https://images.unsplash.com/photo-1527203561188-dae1bc1a417f?auto=format&fit=crop&w=1200&q=80"
              alt="Braided protective style"
              credit="Photo by Jessica Felicio on Unsplash"
              creditHref="https://unsplash.com/@jekafe"
            />
          </div>
        </div>

        <div style={{ background: PAPER, color: INK, borderRadius: 32, padding: "clamp(24px,3.4vw,44px)", minHeight: 420, display: "flex", flexDirection: "column", gap: 24 }}>
          {step === 0 ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#6b5d48" }}>Step 1 of 2</div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, lineHeight: 1.05 }}>What worries you most right now?</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 12 }}>
                {CONCERNS.map((o) => (
                  <button key={o.id} onClick={() => onPickConcern(o.id)} className="dw-quiz-opt" style={optionButton}>
                    <span style={{ fontSize: 17, fontWeight: 700 }}>{o.label}</span>
                    <span style={{ fontSize: 14, color: "#6b5d48" }}>{o.hint}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#6b5d48" }}>Step 2 of 2</span>
                <button onClick={onBack} style={{ background: "none", border: 0, font: "600 13px 'Hanken Grotesk',sans-serif", color: INK, cursor: "pointer", textDecoration: "underline" }}>
                  Back
                </button>
              </div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 36, lineHeight: 1.05 }}>How are you wearing it these days?</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,200px),1fr))", gap: 12 }}>
                {STYLES.map((o) => (
                  <button key={o.id} onClick={() => onPickStyle(o.id)} className="dw-quiz-opt" style={optionButton}>
                    <span style={{ fontSize: 17, fontWeight: 700 }}>{o.label}</span>
                    <span style={{ fontSize: 14, color: "#6b5d48" }}>{o.hint}</span>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 2 && result ? (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>Your DeeWee routine</span>
                <button onClick={onReset} style={{ background: "none", border: 0, font: "600 13px 'Hanken Grotesk',sans-serif", color: INK, cursor: "pointer", textDecoration: "underline" }}>
                  Start over
                </button>
              </div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(34px,3.6vw,46px)", lineHeight: 1.02 }}>{result.headline}</div>
              <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 18, alignItems: "center", background: INK, color: PAPER, borderRadius: 20, padding: 14 }}>
                <div style={{ width: 96, height: 96, borderRadius: 14, overflow: "hidden", background: PAPER }}>
                  <img src={result.product.id === "butter" ? "/assets/butter.png" : "/assets/bottle.png"} alt={result.product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: GOLD }}>We recommend</span>
                  <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26 }}>{result.product.name}</span>
                  <span style={{ fontSize: 14, color: MUTED }}>{result.product.priceLabel}</span>
                </div>
              </div>
              <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {result.steps.map((text, i) => (
                  <li key={i} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 12, fontSize: 16, lineHeight: 1.5, color: "#2d261b" }}>
                    <span style={{ width: 28, height: 28, borderRadius: "50%", background: GOLD, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700 }}>{i + 1}</span>
                    <span>{text}</span>
                  </li>
                ))}
              </ol>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: "auto" }}>
                <button
                  onClick={() => onAddResult(result.product.id)}
                  className="dw-dark-btn"
                  style={{ background: INK, color: PAPER, border: 0, borderRadius: 999, padding: "16px 24px", font: "700 14px 'Hanken Grotesk',sans-serif", cursor: "pointer" }}
                >
                  Add to basket
                </button>
                <a
                  href={result.wa}
                  target="_blank"
                  rel="noreferrer"
                  className="dw-wa-outline"
                  style={{ border: `1.5px solid ${INK}`, color: INK, borderRadius: 999, padding: "15px 22px", fontWeight: 700, fontSize: 14 }}
                >
                  Ask a DeeWee expert on WhatsApp
                </a>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ── before / after ───────────────────────────────────────────────────────

function ResultsCompare({ slider, onSlide }: { slider: number; onSlide: (v: number) => void }) {
  return (
    <section
      id="results"
      style={{
        maxWidth: 1280,
        margin: "0 auto",
        padding: "clamp(72px,9vw,128px) clamp(20px,4vw,48px)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,420px),1fr))",
        gap: "clamp(40px,6vw,88px)",
        alignItems: "center",
      }}
    >
      <div style={{ position: "relative", width: "min(100%,440px)", aspectRatio: "4/5", borderRadius: 28, overflow: "hidden", justifySelf: "center", background: "#221b12", userSelect: "none" }}>
        <img src="/assets/after.png" alt="After two weeks of DeeWee" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
          <img src="/assets/before.png" alt="Before DeeWee" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${slider}%`, width: 2, background: GOLD, transform: "translateX(-1px)", pointerEvents: "none" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: GOLD,
              color: INK,
              display: "grid",
              placeItems: "center",
              fontWeight: 700,
              fontSize: 15,
              boxShadow: "0 8px 24px rgba(0,0,0,.35)",
            }}
          >
            ⟷
          </div>
        </div>
        <span style={{ position: "absolute", top: 16, left: 16, background: "rgba(21,17,11,.85)", color: PAPER, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700, padding: "7px 12px", borderRadius: 999, pointerEvents: "none" }}>
          Before
        </span>
        <span style={{ position: "absolute", top: 16, right: 16, background: GOLD, color: INK, fontSize: 11, letterSpacing: ".16em", textTransform: "uppercase", fontWeight: 700, padding: "7px 12px", borderRadius: 999, pointerEvents: "none" }}>
          2 weeks
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={slider}
          onInput={(e) => onSlide(Number(e.currentTarget.value))}
          onChange={(e) => onSlide(Number(e.currentTarget.value))}
          aria-label="Compare before and after"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "ew-resize", margin: 0 }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", color: MUTED }}>Real customers · unfiltered</div>
        <h2 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: "clamp(44px,5.6vw,80px)", lineHeight: 0.98, letterSpacing: "-.02em", textWrap: "balance" }}>
          Drag to see <span style={{ fontStyle: "italic", color: GOLD }}>two weeks</span> of DeeWee.
        </h2>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, color: BODY_MUTED, maxWidth: "30em" }}>
          No filters, no extensions. Every result on this page comes straight from a customer’s DM — the way it has
          always been shared on our Instagram.
        </p>
        <div style={{ display: "flex", gap: 40, flexWrap: "wrap", paddingTop: 20, borderTop: "1px solid rgba(246,239,226,.1)" }}>
          <div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 52, lineHeight: 1, color: PAPER }}>21.8K</div>
            <div style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>community on Instagram</div>
          </div>
          <div>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 52, lineHeight: 1, color: PAPER }}>Since 2023</div>
            <div style={{ fontSize: 14, color: MUTED, marginTop: 6 }}>of documented reviews</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── reviews ───────────────────────────────────────────────────────────────

function Reviews({ showTranslations }: { showTranslations: boolean }) {
  return (
    <section id="reviews" style={{ background: "#1b160e", borderTop: "1px solid rgba(246,239,226,.08)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(72px,9vw,120px) clamp(20px,4vw,48px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, flexWrap: "wrap", marginBottom: 48 }}>
          <h2 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: "clamp(44px,5.6vw,80px)", lineHeight: 0.98, letterSpacing: "-.02em" }}>
            Straight from <span style={{ fontStyle: "italic", color: GOLD }}>the DMs.</span>
          </h2>
          <p style={{ margin: 0, maxWidth: "22em", fontSize: 16, lineHeight: 1.6, color: MUTED }}>
            In English, Swahili and everything in between — just how our customers talk to us.
          </p>
        </div>
        <div style={{ columns: "3 300px", columnGap: 20 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} style={{ breakInside: "avoid", marginBottom: 20, background: PAPER, color: INK, borderRadius: "22px 22px 22px 6px", padding: "22px 22px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 17, lineHeight: 1.5, textWrap: "pretty" }}>{r.text}</div>
              {showTranslations && r.tr ? (
                <div style={{ fontSize: 14, lineHeight: 1.5, color: "#6b5d48", fontStyle: "italic", borderLeft: `2px solid ${GOLD}`, paddingLeft: 10 }}>{r.tr}</div>
              ) : null}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b5d48" }}>
                <span style={{ fontWeight: 600 }}>{r.who}</span>
                <span>{r.time} ✓✓</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ───────────────────────────────────────────────────────────────────

function FaqSection({ open, onToggle }: { open: number; onToggle: (i: number) => void }) {
  return (
    <section id="faq" style={{ maxWidth: 1080, margin: "0 auto", padding: "clamp(72px,9vw,128px) clamp(20px,4vw,48px)" }}>
      <h2 style={{ margin: "0 0 40px", fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: "clamp(44px,5.6vw,80px)", lineHeight: 0.98, letterSpacing: "-.02em" }}>
        Hair <span style={{ fontStyle: "italic", color: GOLD }}>FAQs.</span>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", borderBottom: "1px solid rgba(246,239,226,.14)" }}>
        {FAQS.map((f, i) => (
          <div key={f.q} style={{ borderTop: "1px solid rgba(246,239,226,.14)" }}>
            <button
              onClick={() => onToggle(i)}
              className="dw-faq-q"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 24,
                padding: "26px 0",
                background: "none",
                border: 0,
                color: PAPER,
                textAlign: "left",
                cursor: "pointer",
                font: "500 clamp(18px,1.8vw,22px) 'Hanken Grotesk',sans-serif",
              }}
            >
              <span>{f.q}</span>
              <span style={{ flex: "none", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(246,239,226,.25)", display: "grid", placeItems: "center", fontSize: 20, color: GOLD }}>
                {open === i ? "−" : "+"}
              </span>
            </button>
            {open === i ? <p style={{ margin: 0, padding: "0 60px 28px 0", fontSize: 17, lineHeight: 1.65, color: BODY_MUTED, maxWidth: "46em" }}>{f.a}</p> : null}
          </div>
        ))}
      </div>
    </section>
  );
}

// ── visit ─────────────────────────────────────────────────────────────────

function Visit() {
  return (
    <section id="visit" style={{ background: GOLD, color: INK }}>
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "clamp(72px,9vw,120px) clamp(20px,4vw,48px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,400px),1fr))",
          gap: "clamp(40px,6vw,80px)",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 12, letterSpacing: ".2em", textTransform: "uppercase", fontWeight: 600 }}>Come say hi</div>
          <h2 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: "clamp(48px,6vw,88px)", lineHeight: 0.95, letterSpacing: "-.02em" }}>
            Star Mall, 2nd floor, <span style={{ fontStyle: "italic" }}>Shop B7.</span>
          </h2>
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, maxWidth: "28em" }}>
            Nairobi CBD. Walk in for a free scalp chat, test the oil on your hand and leave with a routine — or reach
            us on DM and WhatsApp.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
            <a href="https://wa.me/254705472849" target="_blank" rel="noreferrer" className="dw-wa-card" style={{ background: INK, color: PAPER, borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: GOLD }}>WhatsApp</span>
              <span style={{ fontSize: 20, fontWeight: 600 }}>0705 472 849</span>
              <span style={{ fontSize: 14, color: MUTED }}>or 0717 644 557</span>
            </a>
            <div style={{ background: PAPER, borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: "#6b5d48" }}>M-Pesa Paybill</span>
              <span style={{ fontSize: 20, fontWeight: 600 }}>400200</span>
              <span style={{ fontSize: 14, color: "#4a3f2f" }}>Account 892668</span>
            </div>
          </div>
        </div>
        <div style={{ aspectRatio: "5/4", width: "100%" }}>
          <ImageSlot shape="rounded" radius={28} src="/assets/bottle.png" alt="Shop B7 storefront" fit="contain" />
        </div>
      </div>
    </section>
  );
}

// ── community ─────────────────────────────────────────────────────────────

const IG_PHOTOS = [
  { id: "ig-1", src: "https://images.unsplash.com/photo-1608600927239-e968bee5e0f9?auto=format&fit=crop&w=800&q=80", credit: "Photo by Ayo Ogunseinde on Unsplash", creditHref: "https://unsplash.com/@armedshutter" },
  { id: "ig-2", src: "https://images.unsplash.com/photo-1713845784497-fe3d7ed176d8?auto=format&fit=crop&w=800&q=80", credit: "Photo by Godfred Kwakye on Unsplash", creditHref: "https://unsplash.com/@creativekg" },
  { id: "ig-3", src: "https://images.unsplash.com/photo-1588527962980-72746d95973e?auto=format&fit=crop&w=800&q=80", credit: "Photo by Leighann Blackwood on Unsplash", creditHref: "https://unsplash.com/@ohleighann" },
  { id: "ig-4", src: "https://images.unsplash.com/photo-1604853321570-a48853f54c58?auto=format&fit=crop&w=800&q=80", credit: "Photo by Flow Clark on Unsplash", creditHref: "https://unsplash.com/@flowclark" },
];

function Community() {
  return (
    <section style={{ maxWidth: 1280, margin: "0 auto", padding: "clamp(72px,9vw,120px) clamp(20px,4vw,48px) 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 24, flexWrap: "wrap", marginBottom: 36 }}>
        <h2 style={{ margin: 0, fontFamily: "'Instrument Serif',serif", fontWeight: 400, fontSize: "clamp(40px,5vw,72px)", lineHeight: 0.98, letterSpacing: "-.02em" }}>
          Join <span style={{ fontStyle: "italic", color: GOLD }}>21.8K</span> healthy-hair goals.
        </h2>
        <a href="https://instagram.com/deewee_oils" target="_blank" rel="noreferrer" className="dw-outline-btn" style={{ border: "1px solid rgba(246,239,226,.3)", color: PAPER, borderRadius: 999, padding: "14px 22px", fontWeight: 600, fontSize: 14 }}>
          Follow @deewee_oils
        </a>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 12 }}>
        {IG_PHOTOS.map((p) => (
          <div key={p.id} style={{ aspectRatio: "1/1" }}>
            <ImageSlot shape="rounded" radius={20} src={p.src} alt="DeeWee community on Instagram" credit={p.credit} creditHref={p.creditHref} />
          </div>
        ))}
      </div>
    </section>
  );
}

// ── footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer style={{ maxWidth: 1280, margin: "0 auto", padding: "56px clamp(20px,4vw,48px) 40px", display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: "clamp(72px,16vw,220px)", lineHeight: 0.85, letterSpacing: "-.04em", color: PAPER }}>
        Dee<span style={{ fontStyle: "italic", color: GOLD }}>Wee</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap", fontSize: 14, color: MUTED, borderTop: "1px solid rgba(246,239,226,.1)", paddingTop: 24 }}>
        <span>Unleash the power of nature · 100% natural oils made in Kenya</span>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="https://instagram.com/deewee_oils" target="_blank" rel="noreferrer">
            Instagram @deewee_oils
          </a>
          <a href="#top">Back to top</a>
        </div>
      </div>
    </footer>
  );
}

// ── floating bits: concept badge, toast, cart drawer ────────────────────

function ConceptBadge() {
  return (
    <div style={{ position: "fixed", left: 20, bottom: 20, zIndex: 30, background: PAPER, color: INK, borderRadius: 999, padding: "9px 16px", fontSize: 12, fontWeight: 600, boxShadow: "0 10px 30px rgba(0,0,0,.35)" }}>
      Website concept for DeeWee Natural Oil
    </div>
  );
}

function Toast({ text, onOpenCart }: { text: string; onOpenCart: () => void }) {
  return (
    <div style={{ position: "fixed", right: 20, bottom: 20, zIndex: 45, background: GREEN, color: PAPER, borderRadius: 16, padding: "14px 18px", fontSize: 14, fontWeight: 600, display: "flex", gap: 14, alignItems: "center", boxShadow: "0 14px 40px rgba(0,0,0,.4)" }}>
      <span>{text}</span>
      <button onClick={onOpenCart} className="dw-fill-btn" style={{ background: GOLD, color: INK, border: 0, borderRadius: 999, padding: "8px 14px", font: "700 13px 'Hanken Grotesk',sans-serif", cursor: "pointer" }}>
        View basket
      </button>
    </div>
  );
}

type CartLine = (typeof PRODUCTS)[number] & { qty: number; lineLabel: string };

function CartDrawer({
  items,
  count,
  totalLabel,
  waOrder,
  onClose,
  onAddOil,
  onInc,
  onDec,
}: {
  items: CartLine[];
  count: number;
  totalLabel: string;
  waOrder: string;
  onClose: () => void;
  onAddOil: () => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,8,5,.6)", backdropFilter: "blur(4px)" }} />
      <aside style={{ position: "relative", width: "min(100%,440px)", height: "100%", background: PAPER, color: INK, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px", borderBottom: "1px solid rgba(21,17,11,.1)" }}>
          <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 32 }}>Your basket</span>
          <button onClick={onClose} aria-label="Close" style={{ width: 44, height: 44, borderRadius: "50%", border: "1px solid rgba(21,17,11,.2)", background: "none", fontSize: 18, cursor: "pointer", color: INK }}>
            ✕
          </button>
        </div>

        {count === 0 ? (
          <div style={{ padding: "48px 28px", display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
            <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, lineHeight: 1.1 }}>Nothing here yet — your edges are waiting.</div>
            <button onClick={onAddOil} className="dw-dark-btn" style={{ background: INK, color: PAPER, border: 0, borderRadius: 999, padding: "14px 22px", font: "700 14px 'Hanken Grotesk',sans-serif", cursor: "pointer" }}>
              Add Growth Oil · KES 650
            </button>
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", padding: "8px 28px" }}>
          {items.map((i) => (
            <div key={i.id} style={{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "center", padding: "16px 0", borderBottom: "1px solid rgba(21,17,11,.1)" }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
                <img src={i.img} alt={i.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontWeight: 700 }}>{i.name}</span>
                <span style={{ fontSize: 14, color: "#6b5d48" }}>{i.lineLabel}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid rgba(21,17,11,.2)", borderRadius: 999, padding: 4 }}>
                <button onClick={() => onDec(i.id)} aria-label="Less" style={{ width: 32, height: 32, borderRadius: "50%", border: 0, background: "none", fontSize: 16, cursor: "pointer", color: INK }}>
                  −
                </button>
                <span style={{ minWidth: 16, textAlign: "center", fontWeight: 700 }}>{i.qty}</span>
                <button onClick={() => onInc(i.id)} aria-label="More" style={{ width: 32, height: 32, borderRadius: "50%", border: 0, background: "none", fontSize: 16, cursor: "pointer", color: INK }}>
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {count > 0 ? (
          <div style={{ marginTop: "auto", padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 18, borderTop: "1px solid rgba(21,17,11,.1)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: 15, color: "#4a3f2f" }}>Total</span>
              <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 38 }}>{totalLabel}</span>
            </div>
            <div style={{ background: INK, color: PAPER, borderRadius: 20, padding: 20, display: "flex", flexDirection: "column", gap: 10, fontSize: 14, lineHeight: 1.5 }}>
              <span style={{ fontSize: 12, letterSpacing: ".14em", textTransform: "uppercase", color: GOLD, fontWeight: 700 }}>Pay with M-Pesa</span>
              <span>
                1 · Lipa na M-Pesa → Paybill <strong>400200</strong>
              </span>
              <span>
                2 · Account number <strong>892668</strong>
              </span>
              <span>
                3 · Amount <strong>{totalLabel}</strong>, then send your order below
              </span>
            </div>
            <a href={waOrder} target="_blank" rel="noreferrer" className="dw-order-btn" style={{ background: GREEN, color: PAPER, borderRadius: 999, padding: 18, textAlign: "center", fontWeight: 700, fontSize: 15 }}>
              Send order on WhatsApp
            </a>
            <span style={{ fontSize: 13, color: "#6b5d48", textAlign: "center" }}>Or pick up at Star Mall, 2nd floor, Shop B7</span>
          </div>
        ) : null}
      </aside>
    </div>
  );
}

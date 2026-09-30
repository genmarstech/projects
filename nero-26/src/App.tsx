import { useEffect, useRef, useState } from "react";
import { CUSTOM_CURSOR, POINTER_QUERY, SHOW_LOADER } from "./config";
import { Cursor } from "./components/Cursor";
import { Footer } from "./components/Footer";
import { Lightbox } from "./components/Lightbox";
import { Loader } from "./components/Loader";
import { Marquee } from "./components/Marquee";
import { Nav } from "./components/Nav";
import { RowPreview } from "./components/RowPreview";
import { Calendar } from "./sections/Calendar";
import { Driver } from "./sections/Driver";
import { Hero } from "./sections/Hero";
import { Machine } from "./sections/Machine";
import { Paddock } from "./sections/Paddock";
import { TyreLab } from "./sections/TyreLab";
import { c, font } from "./theme";
import { useScrollFx } from "./useScrollFx";
import { useStore } from "./useStore";

export default function App() {
  const root = useRef<HTMLDivElement>(null);
  const store = useStore();

  // The scroll loop reads the livery every frame without React being
  // involved, so the current value is mirrored into a ref rather than
  // passed as a dependency that would tear down two WebGL scenes.
  const liveryRef = useRef(store.livery);
  liveryRef.current = store.livery;

  useScrollFx(root, { liveryRef, compoundColor: store.compoundData.color });

  // Whether to replace the pointer at all. Decided once on mount and kept in
  // state so the two cursor nodes are simply not rendered on a touch device
  // — hiding them with CSS would still leave a `mousemove` listener and two
  // elements being transformed sixty times a second for nobody.
  const [pointer, setPointer] = useState(false);
  useEffect(() => {
    const mq = matchMedia(POINTER_QUERY);
    const sync = () => setPointer(CUSTOM_CURSOR && mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <div
      ref={root}
      style={{
        position: "relative",
        fontFamily: font.display,
        background: c.black,
        color: c.ink,
        cursor: pointer ? "none" : "auto",
      }}
    >
      {SHOW_LOADER && <Loader />}
      {pointer && <Cursor />}
      <RowPreview />
      <Lightbox store={store} />

      <Nav />

      <main>
        <Hero />
        <Marquee />
        <Machine store={store} />
        <TyreLab store={store} />
        <Driver />
        <Calendar />
        <Paddock store={store} />
      </main>

      <Footer store={store} />
    </div>
  );
}

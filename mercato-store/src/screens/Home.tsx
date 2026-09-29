import { Hero } from "../sections/Hero";
import { Marquee } from "../components/Marquee";
import { Categories } from "../sections/Categories";
import { HarvestRail } from "../sections/HarvestRail";
import { BestSellers } from "../sections/BestSellers";
import { RecipeBundle } from "../sections/RecipeBundle";
import { OrderYourWay } from "../sections/OrderYourWay";
import type { StoreApi } from "../useStore";
import type { ScrollRefs } from "../useScrollFx";

export function Home({ s, refs }: { s: StoreApi; refs: ScrollRefs }) {
  return (
    <main>
      <Hero s={s} refs={refs} />
      <Marquee />
      <Categories s={s} />
      <HarvestRail s={s} refs={refs} />
      <BestSellers s={s} />
      <RecipeBundle s={s} refs={refs} />
      <OrderYourWay s={s} />
    </main>
  );
}

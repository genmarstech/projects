import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { Toast } from "./components/Toast";
import { OrderDrawer } from "./components/OrderDrawer";
import { Dashboard } from "./screens/Dashboard";
import { Orders } from "./screens/Orders";
import { Inventory } from "./screens/Inventory";
import { Slots } from "./screens/Slots";
import { Team } from "./screens/Team";
import { Customers } from "./screens/Customers";
import { Promotions } from "./screens/Promotions";
import { SECTIONS } from "./data";
import { isLow, useStore } from "./useStore";

const TITLES = Object.fromEntries(SECTIONS);

export function App() {
  const store = useStore();

  const newCount = store.orders.filter((o) => o.status === "New").length;
  const lowCount = store.products.filter(isLow).length;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", minHeight: "100vh" }}>
      <Sidebar store={store} newCount={newCount} lowCount={lowCount} />

      <main style={{ flex: "1 1 600px", minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Topbar store={store} title={TITLES[store.section]} />

        <div style={{ padding: "clamp(20px,3vw,36px)", display: "flex", flexDirection: "column", gap: 24 }}>
          {store.section === "dash" ? <Dashboard store={store} /> : null}
          {store.section === "orders" ? <Orders store={store} /> : null}
          {store.section === "inventory" ? <Inventory store={store} /> : null}
          {store.section === "slots" ? <Slots store={store} /> : null}
          {store.section === "team" ? <Team store={store} /> : null}
          {store.section === "customers" ? <Customers store={store} /> : null}
          {store.section === "promos" ? <Promotions store={store} /> : null}
        </div>
      </main>

      <OrderDrawer store={store} />
      <Toast message={store.toast} />
    </div>
  );
}

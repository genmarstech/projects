import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { applyTheme, fontHref } from "./theme";
import "./styles.css";

// Both before the first render. The palette must exist as CSS variables
// before anything styled against them paints, and the stylesheet link is
// built from the same constant the variables come from.
applyTheme();
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = fontHref();
document.head.appendChild(link);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

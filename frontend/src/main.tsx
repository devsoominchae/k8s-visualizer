import "@radix-ui/themes/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Theme } from "@radix-ui/themes";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
).render(
  <Theme style={{ width: "100vw", height: "100vh" }}>
    <App />
  </Theme>
);

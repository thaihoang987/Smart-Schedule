import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
// CSS bat buoc cua @ncdai/react-wheel-picker (position/overflow cho phan tu
// cuon) - thieu file nay khien cac so bi tran ra ngoai, de len UI ben duoi
// (da gap thuc te 2026-09-22).
import "@ncdai/react-wheel-picker/style.css";
import "./styles/global.css";

// The Home Assistant host owns the device safe area around its Ingress iframe.
document.documentElement.dataset.embedded = String(window.self !== window.top);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

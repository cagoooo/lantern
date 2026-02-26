import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// 攔截 PointerLock SecurityError，防止 Vite 錯誤彈窗跳出(純開發期無害錯誤)
window.addEventListener("unhandledrejection", (e) => {
    if (e.reason?.name === "SecurityError" || e.reason?.message?.includes("lock")) {
        e.preventDefault();
    }
});

createRoot(document.getElementById("root")!).render(<App />);

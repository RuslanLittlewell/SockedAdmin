import { createRoot } from "react-dom/client";
import { RecoilRoot } from "recoil";
import { ToastContainer } from 'react-toastify';
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <RecoilRoot>
      <ToastContainer
        theme="dark"
      />
      <App />
    </RecoilRoot>
);

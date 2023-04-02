import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Modal from 'react-modal';
import App from "./App";

//CSS
import "./styles.css";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

Modal.setAppElement('#root');

root.render(<App />);

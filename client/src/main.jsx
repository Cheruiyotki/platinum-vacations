import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { PackageProvider } from "./context/PackageContext";
import { ReviewProvider } from "./context/ReviewContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <PackageProvider>
        <ReviewProvider>
          <App />
        </ReviewProvider>
      </PackageProvider>
    </BrowserRouter>
  </React.StrictMode>
);

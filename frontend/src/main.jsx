import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import TasksProvider from "./contexts/TasksContext.jsx";
import { TeamsProvider } from "./contexts/TeamsContext.jsx";
import { ColorModeProvider } from "./theme.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ColorModeProvider>
        <AuthProvider>
          <TasksProvider>
            <TeamsProvider>
              <App />
            </TeamsProvider>
          </TasksProvider>
        </AuthProvider>
      </ColorModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

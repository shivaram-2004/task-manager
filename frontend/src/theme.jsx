// src/theme.jsx
import React, { createContext, useContext, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const ColorModeContext = createContext();

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error("useColorMode must be used within ColorModeProvider");
  }
  return context;
};

export function ColorModeProvider({ children }) {
  const [mode, setMode] = useState("light");

  // toggle function
  const toggleColorMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  // create the MUI theme
  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "dark"
            ? {
                background: { default: "#121212", paper: "#1E1E1E" },
                text: { primary: "#fff" },
              }
            : {
                background: { default: "#fafafa", paper: "#fff" },
                text: { primary: "#000" },
              }),
        },
        typography: {
          fontFamily: "'Poppins', sans-serif",
        },
      }),
    [mode]
  );

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode, muiTheme }}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

// optional default export if you need it
const theme = createTheme({
  palette: { mode: "light" },
});
export default theme;

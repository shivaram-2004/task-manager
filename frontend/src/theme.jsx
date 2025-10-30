import React from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const ColorModeContext = React.createContext();

export function useColorMode() {
  const context = React.useContext(ColorModeContext);
  if (!context) throw new Error("useColorMode must be used within ColorModeProvider");
  return context;
}

export default function theme(mode) {
  return createTheme({
    palette: {
      mode,
    },
  });
}

export function ColorModeProvider({ children }) {
  const [mode, setMode] = React.useState("light");
  const toggleColorMode = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

  const muiTheme = createTheme({ palette: { mode } });

  return (
    <ColorModeContext.Provider value={{ mode, toggleColorMode, muiTheme }}>
      <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
}

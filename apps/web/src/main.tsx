import React from "react";
import ReactDOM from "react-dom/client";
import { ChakraProvider } from "@chakra-ui/react";
import App from "./App";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";

const muiTheme = createTheme({
  // MUIのテーマ設定
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MuiThemeProvider theme={muiTheme}>
      <ChakraProvider>
        <App />
      </ChakraProvider>
    </MuiThemeProvider>
  </React.StrictMode>
);

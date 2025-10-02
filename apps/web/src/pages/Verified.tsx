// VerifiedPage.tsx
import React from "react";
import { Typography, Box } from "@mui/material";

export const Verified = () => {
  return (
    <Box sx={{ mt: 4, textAlign: "center" }}>
      <Typography variant="h5" gutterBottom>
        メール認証が完了しました
      </Typography>
    </Box>
  );
};

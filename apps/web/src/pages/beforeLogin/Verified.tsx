// VerifiedPage.tsx
import React from "react";
import { Box, Heading } from "@chakra-ui/react";

export const Verified = () => {
  return (
    <Box textAlign="center" mt={8}>
      <Heading as="h3" size="md" mb={3}>
        メール認証が完了しました
      </Heading>
    </Box>
  );
};

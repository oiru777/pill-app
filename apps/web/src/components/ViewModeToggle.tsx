import React from "react";
import { Box, ButtonGroup, Button } from "@chakra-ui/react";
import { ViewMode } from "../types";

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  onViewModeChange,
}) => {
  return (
    <Box textAlign="center">
      <ButtonGroup isAttached variant="outline" colorScheme="blue" mb={3}>
        <Button
          onClick={() => onViewModeChange("day")}
          isActive={viewMode === "day"}
        >
          日ごと
        </Button>
        <Button
          onClick={() => onViewModeChange("week")}
          isActive={viewMode === "week"}
        >
          週ごと
        </Button>
        <Button
          onClick={() => onViewModeChange("month")}
          isActive={viewMode === "month"}
        >
          月ごと
        </Button>
      </ButtonGroup>
    </Box>
  );
};

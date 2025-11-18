import React from "react";
import { Box, ButtonGroup, Button, Input } from "@chakra-ui/react";

interface FilterPanelProps {
  monthFilter: null | "current" | string;
  onMonthFilterChange: (filter: null | "current" | string) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  monthFilter,
  onMonthFilterChange,
}) => {
  return (
    <Box textAlign="center">
      <ButtonGroup isAttached variant="outline" colorScheme="blue" mb={3}>
        <Button
          onClick={() => onMonthFilterChange(null)}
          isActive={monthFilter === null}
        >
          全件
        </Button>
        <Button
          onClick={() => onMonthFilterChange("current")}
          isActive={monthFilter === "current"}
        >
          今月
        </Button>
      </ButtonGroup>

      <Input
        type="month"
        w="150px"
        display="inline-block"
        ml={3}
        onChange={(e) => onMonthFilterChange(e.target.value)}
        value={
          typeof monthFilter === "string" && monthFilter !== "current"
            ? monthFilter
            : ""
        }
      />
    </Box>
  );
};

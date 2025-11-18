import React, { useState } from "react";
import { VStack } from "@chakra-ui/react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FilterPanel } from "../components/FilterPanel";
import { ViewModeToggle } from "../components/ViewModeToggle";
import { UsageChart } from "../components/UsageChart";
import { UsageStatisticsTable } from "../components/UsageStatisticsTable";
import { CostBreakdownTable } from "../components/CostBreakdownTable";
import { usePills } from "../hooks/usePills";
import { useUsageData } from "../hooks/useUsageData";
import type { ViewMode } from "../types";
import BackButton from "../components/BackButton";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const UsageSummaryChart: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [monthFilter, setMonthFilter] = useState<null | "current" | string>(
    null
  );

  const pills = usePills();
  const { groupedData, labels, costBreakdown, totalCost } = useUsageData(
    viewMode,
    monthFilter,
    pills
  );

  return (
    <VStack spacing={6} align="stretch">
      <BackButton />
      <FilterPanel
        monthFilter={monthFilter}
        onMonthFilterChange={setMonthFilter}
      />

      <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />

      <UsageChart
        groupedData={groupedData}
        labels={labels}
        viewMode={viewMode}
      />

      <UsageStatisticsTable costBreakdown={costBreakdown} />

      <CostBreakdownTable costBreakdown={costBreakdown} totalCost={totalCost} />
    </VStack>
  );
};

export default UsageSummaryChart;

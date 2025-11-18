import React from "react";
import {
  Box,
  Heading,
  Text,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { CostBreakdown } from "../types";

interface CostBreakdownTableProps {
  costBreakdown: CostBreakdown[];
  totalCost: number;
}

export const CostBreakdownTable: React.FC<CostBreakdownTableProps> = ({
  costBreakdown,
  totalCost,
}) => {
  return (
    <Box p={5} borderWidth="1px" borderRadius="md" bg="white" shadow="md">
      <Heading size="md" mb={3}>
        薬にかかった費用
      </Heading>
      {costBreakdown.length > 0 ? (
        <>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>薬剤名</Th>
                  <Th isNumeric>合計使用量</Th>
                  <Th isNumeric>単価（円）</Th>
                  <Th isNumeric>小計（円）</Th>
                </Tr>
              </Thead>
              <Tbody>
                {costBreakdown.map((item) => (
                  <Tr key={item.pill_name}>
                    <Td>{item.pill_name}</Td>
                    <Td isNumeric>{item.total_quantity}</Td>
                    <Td isNumeric>{item.unit_price.toLocaleString()}</Td>
                    <Td isNumeric fontWeight="bold">
                      {item.total_cost.toLocaleString()}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Box mt={4} textAlign="right">
            <Text fontSize="lg" fontWeight="bold" color="blue.600">
              合計: ¥{totalCost.toLocaleString()}
            </Text>
          </Box>
        </>
      ) : (
        <Text color="gray.500">データがありません</Text>
      )}
    </Box>
  );
};

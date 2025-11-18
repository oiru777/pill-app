// src/components/UsageDaysCard.tsx
import type { FC } from "react";
import { Box, VStack, Text, Spinner, Badge } from "@chakra-ui/react";
import type { StopPillData } from "../../types";

interface Props {
  loading: boolean;
  error: string | null;
  data: StopPillData | null;
}

export const UsageDaysCard: FC<Props> = ({ loading, error, data }) => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      p={6}
      bg="white"
      shadow="md"
      textAlign="center"
    >
      {loading ? (
        <Spinner size="lg" color="blue.500" />
      ) : error ? (
        <Text color="red.500" fontSize="sm">
          取得失敗
        </Text>
      ) : data ? (
        <VStack spacing={2}>
          <Text fontSize="sm" fontWeight="medium" color="gray.600">
            連続服用日数
          </Text>

          <Text fontSize="5xl" fontWeight="bold" color="blue.500">
            {data.consecutive_usage_days}
          </Text>

          <Text fontSize="lg" color="gray.500">
            日
          </Text>

          {data.consecutive_usage_days >= 30 && (
            <Badge
              colorScheme="blue"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
            >
              継続中
            </Badge>
          )}

          <Text fontSize="xs" color="gray.500" mt={2}>
            最高記録: {data.max_consecutive_usage_days}日
          </Text>
        </VStack>
      ) : (
        <Text color="gray.500" fontSize="sm">
          データなし
        </Text>
      )}
    </Box>
  );
};

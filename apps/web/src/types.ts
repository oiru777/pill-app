export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
};

export type LoginFormProps = {
  onLogin: (user: User) => void;
};

export interface StopPillData {
  stop_days: number;
  consecutive_usage_days: number;
  max_stop_days: number;
  max_consecutive_usage_days: number;
  last_usage_date: string | null;
  message: string;
}

xport interface UsageData {
  timestamp: string;
  pill_name: string;
  quantity: number;
}

export interface Pill {
  id: number;
  name: string;
  price: number;
}

export interface CostBreakdown {
  pill_name: string;
  total_quantity: number;
  unit_price: number;
  total_cost: number;
  average_quantity: number;
  max_quantity: number;
  usage_count: number;
}

export type ViewMode = "day" | "week" | "month";

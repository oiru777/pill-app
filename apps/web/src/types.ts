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

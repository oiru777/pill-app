export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string;
};

export type LoginFormProps = {
  onLogin: (user: User) => void;
};

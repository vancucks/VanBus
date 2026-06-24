export type BusFeedback = {
  id: string;
  busId: string;
  userId: string;
  userName?: string;
  text: string;
  createdAt: string;
};

export type BusFeedbackRow = {
  id: string;
  bus_id: string;
  user_id: string;
  text: string;
  created_at: string;
};

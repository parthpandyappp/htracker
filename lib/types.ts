export type User = {
  id: string;
  username: string;
  email: string;
};

export type Habit = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null;
  userId: string;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string;
  value: number;
  habit?: Habit;
};

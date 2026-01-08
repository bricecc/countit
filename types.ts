export interface Counter {
  id: string;
  title: string;
  category: string;
  count: number;
  trackTime: boolean;
  history: number[]; // Array of timestamps (ms)
  color: string;
  createdAt: number;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface AppState {
  counters: Counter[];
  user: UserProfile | null;
}

export const CATEGORIES = [
  'General',
  'Health',
  'Habits',
  'Work',
  'Social',
  'Fitness'
];

export const COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-red-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-teal-500',
  'bg-indigo-500'
];
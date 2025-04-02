export interface Reminder {
  _id: string;
  id: string;
  name: string;
  month: string;
  day: string;
  reminder: string;
  email?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface RemindersResponse {
  reminders: Reminder[];
} 
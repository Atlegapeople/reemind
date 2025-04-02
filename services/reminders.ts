import type { Reminder, ApiResponse, RemindersResponse } from '@/types';

export const reminderService = {
  async fetchReminders(email: string): Promise<ApiResponse<RemindersResponse>> {
    const res = await fetch('/api/reminders/fetch', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async createReminder(reminder: Reminder): Promise<ApiResponse<Reminder>> {
    const res = await fetch('/api/reminders', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    });
    return res.json();
  },

  async updateReminder(id: string, reminder: Reminder): Promise<ApiResponse<Reminder>> {
    const res = await fetch(`/api/reminders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reminder),
    });
    return res.json();
  },

  async deleteReminder(id: string): Promise<ApiResponse<void>> {
    const res = await fetch(`/api/reminders/${id}`, {
      method: "DELETE",
    });
    return res.json();
  },

  async logout(): Promise<ApiResponse<void>> {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    return res.json();
  }
}; 
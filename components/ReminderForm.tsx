import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Reminder } from "@/types";

interface ReminderFormProps {
  reminder: Reminder;
  onSubmit: (reminder: Reminder) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function ReminderForm({ reminder, onSubmit, onCancel, isSubmitting }: ReminderFormProps) {
  const [formData, setFormData] = useState(reminder);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const getMaxDays = (month: string) => {
    const monthNum = parseInt(month);
    if (monthNum === 2) return 29; // Account for leap years
    if ([4, 6, 9, 11].includes(monthNum)) return 30;
    return 31;
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Month</Label>
          <select
            value={formData.month}
            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
            className="w-full rounded-md border p-2 text-sm"
            required
            disabled={isSubmitting}
          >
            <option value="">Select month</option>
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1}>{month}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Day</Label>
          <Input
            type="number"
            min="1"
            max={formData.month ? getMaxDays(formData.month) : 31}
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: e.target.value })}
            required
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div>
        <Label>Days Before</Label>
        <Input
          type="number"
          min="0"
          max="365"
          value={formData.reminder}
          onChange={(e) => setFormData({ ...formData, reminder: e.target.value })}
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {reminder._id ? "Update Reminder" : "Create Reminder"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
} 
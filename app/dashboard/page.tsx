"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "@/components/columns";
import type { Reminder } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, LogOut, Calendar, Download } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Cookies from "js-cookie";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Reminder {
  _id: string;
  name: string;
  month: string;
  day: string;
  reminder: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  const email = Cookies.get("reemind_user") || "";

  const fetchReminders = async () => {
    if (!email) return;
    setLoading(true);
    try {
        const res = await fetch('/api/reminders/fetch', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data?.reminders) {
        const sorted = data.reminders.sort((a: Reminder, b: Reminder) =>
          a.name.localeCompare(b.name)
        );
        setReminders(sorted);
      }
    } catch (err) {
      toast.error("Failed to fetch reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [email]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      Cookies.remove("reemind_user");
      router.push("/");
      toast.success("Logged out successfully");
    } catch (err) {
      toast.error("Failed to logout");
    }
  };

  const handleDeleteClick = (id: string) => {
    setReminderToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reminderToDelete) return;
    try {
      await fetch(`/api/reminders/${reminderToDelete}`, { method: "DELETE" });
      toast.success("Reminder deleted");
      fetchReminders();
    } catch (err) {
      toast.error("Failed to delete reminder");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) return;
    try {
      await Promise.all(
        selectedRows.map(id => 
          fetch(`/api/reminders/${id}`, { method: "DELETE" })
        )
      );
      toast.success(`Deleted ${selectedRows.length} reminders`);
      fetchReminders();
      setSelectedRows([]);
    } catch (err) {
      toast.error("Failed to delete reminders");
    }
  };

  const exportToCSV = () => {
    const headers = "Name,Month,Day,Reminder Days\n";
    const csvContent = reminders.reduce((acc, reminder) => {
        return `${acc}${reminder.name},${reminder.month},${reminder.day},${reminder.reminder}\n`;
    }, headers);
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "birthday-reminders.csv";
    link.click();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const upcomingBirthdays = reminders.map(r => {
    const today = new Date();
    const birthday = new Date(today.getFullYear(), Number(r.month) - 1, Number(r.day));
    if (birthday < today) birthday.setFullYear(today.getFullYear() + 1);
    const diffDays = Math.ceil((birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { ...r, diffDays };
  }).sort((a, b) => a.diffDays - b.diffDays);

  const currentMonth = new Date().getMonth() + 1;
  const birthdaysThisMonth = reminders.filter(r => Number(r.month) === currentMonth);

  const columns: ColumnDef<Reminder>[] = [
    { 
      accessorKey: "name", 
      header: "Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      )
    },
    {
      accessorKey: "month",
      header: "Month",
      cell: ({ row }) => monthNames[Number(row.original.month) - 1] || row.original.month,
    },
    { accessorKey: "day", header: "Day" },
    { 
      accessorKey: "reminder", 
      header: "Days Before",
      cell: ({ row }) => `${row.getValue("reminder")} days`
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              setSelectedReminder(row.original);
              setIsModalOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDeleteClick(row.original._id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Birthday Reminders</h1>
        <div className="flex space-x-2">
          <Input
            placeholder="Search reminders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48"
          />
          <Button
            onClick={() => {
              setSelectedReminder({ 
                _id: "", 
                name: "", 
                month: "", 
                day: "", 
                reminder: "7" 
              });
              setIsModalOpen(true);
            }}
            className="bg-[#17C3B2] hover:bg-[#17C3B2]/90 text-white"
          >
            + New Reminder
          </Button>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Reminders</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reminders.length}</div>
            {upcomingBirthdays.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Next: {upcomingBirthdays[0].name} ({monthNames[Number(upcomingBirthdays[0].month) - 1]}/{upcomingBirthdays[0].day}) — in {upcomingBirthdays[0].diffDays} days
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{birthdaysThisMonth.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {monthNames[currentMonth - 1]} birthdays
            </p>
          </CardContent>
        </Card>
      </div>

      {selectedRows.length > 0 && (
        <div className="flex space-x-2 mb-4">
          <Button 
            variant="destructive" 
            size="sm"
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedRows.length})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedRows([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={exportToCSV}
        >
          <Download className="h-4 w-4 mr-2" /> Export to CSV
        </Button>
      </div>

      <div className="rounded-md border">
      <DataTable<Reminder>
  columns={columns}
  data={reminders.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  )}
  onRowSelectionChange={setSelectedRows}
/>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this reminder from your list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedReminder?._id ? "Edit Reminder" : "New Reminder"}
      >
        {selectedReminder && (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const method = selectedReminder._id ? "PUT" : "POST";
                const url = selectedReminder._id
                  ? `/api/reminders/${selectedReminder._id}`
                  : "/api/reminders";
                const res = await fetch(url, {
                  method,
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(selectedReminder),
                });
                const result = await res.json();
                if (result.success) {
                  toast.success(
                    selectedReminder._id 
                      ? "Reminder updated" 
                      : "Reminder created"
                  );
                  fetchReminders();
                  setIsModalOpen(false);
                }
              } catch (err) {
                toast.error("Failed to save reminder");
              }
            }}
          >
            <div>
              <Label>Name</Label>
              <Input
                value={selectedReminder.name}
                onChange={(e) => setSelectedReminder({ ...selectedReminder, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Month</Label>
                <select
                  value={selectedReminder.month}
                  onChange={(e) => setSelectedReminder({ ...selectedReminder, month: e.target.value })}
                  className="w-full rounded-md border p-2 text-sm"
                  required
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
                  max="31"
                  value={selectedReminder.day}
                  onChange={(e) => setSelectedReminder({ ...selectedReminder, day: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Days Before</Label>
              <Input
                type="number"
                min="0"
                value={selectedReminder.reminder}
                onChange={(e) => setSelectedReminder({ ...selectedReminder, reminder: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4">
              {selectedReminder._id ? "Update Reminder" : "Create Reminder"}
            </Button>
          </form>
        )}
      </Modal>
    </div>
  );
}
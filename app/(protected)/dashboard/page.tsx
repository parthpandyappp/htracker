"use client";

import { useEffect, useState } from "react";
import { Plus, ListChecks } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import { Habit } from "@/lib/types";
import { HabitCard } from "@/components/HabitCard";
import { HabitFormModal, HabitFormValues, habitToFormValues } from "@/components/HabitFormModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadHabits() {
    setLoading(true);
    try {
      const data = await apiFetch<{ habits: Habit[] }>("/habits");
      setHabits(data.habits);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load habits");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHabits();
  }, []);

  async function handleCreate(values: HabitFormValues) {
    await apiFetch("/habits", {
      method: "POST",
      body: JSON.stringify(values),
    });
    setShowCreate(false);
    toast.success("Habit created");
    await loadHabits();
  }

  async function handleEdit(values: HabitFormValues) {
    if (!editingHabit) return;
    await apiFetch(`/habits/${editingHabit.id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    setEditingHabit(null);
    toast.success("Habit updated");
    await loadHabits();
  }

  async function handleDelete() {
    if (!deletingHabit) return;
    setDeleting(true);
    try {
      await apiFetch(`/habits/${deletingHabit.id}`, { method: "DELETE" });
      setDeletingHabit(null);
      toast.success("Habit deleted");
      await loadHabits();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete habit");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Your habits</h1>
        <Button onClick={() => setShowCreate(true)}>
          <Plus />
          New habit
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : habits.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No habits yet"
          description="Create your first habit to start building a streak."
          action={
            <Button onClick={() => setShowCreate(true)}>
              <Plus />
              Create a habit
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onEdit={() => setEditingHabit(habit)}
              onDelete={() => setDeletingHabit(habit)}
            />
          ))}
        </div>
      )}

      <HabitFormModal
        open={showCreate}
        title="New habit"
        description="Add a habit you want to start tracking."
        submitLabel="Create habit"
        onSubmit={handleCreate}
        onOpenChange={setShowCreate}
      />

      <HabitFormModal
        key={editingHabit?.id ?? "edit"}
        open={!!editingHabit}
        title="Edit habit"
        description="Update the details for this habit."
        submitLabel="Save changes"
        initialValues={editingHabit ? habitToFormValues(editingHabit) : undefined}
        onSubmit={handleEdit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
      />

      <ConfirmDialog
        open={!!deletingHabit}
        title="Delete habit"
        message={`Are you sure you want to delete "${deletingHabit?.name}"? This will also delete all of its check-in history.`}
        confirmLabel="Delete"
        danger
        submitting={deleting}
        onConfirm={handleDelete}
        onOpenChange={(open) => !open && setDeletingHabit(null)}
      />
    </div>
  );
}

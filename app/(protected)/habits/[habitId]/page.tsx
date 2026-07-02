"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api";
import { Habit, HabitLog } from "@/lib/types";
import { buildHeatmapWeeks, getTodayKey, keyFromUtcIso, toUtcInstant, DayCell } from "@/lib/heatmap";
import { Heatmap } from "@/components/Heatmap";
import { HabitFormModal, HabitFormValues, habitToFormValues } from "@/components/HabitFormModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const WEEKS_TO_SHOW = 53;

export default function HabitDetailPage() {
  const { habitId } = useParams<{ habitId: string }>();
  const router = useRouter();

  const { weeks, monthLabels, rangeStart, rangeEnd } = useMemo(
    () => buildHeatmapWeeks(WEEKS_TO_SHOW),
    []
  );

  const [habit, setHabit] = useState<Habit | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(new Set());
  const [pendingKeys, setPendingKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Refreshed periodically so a tab left open across midnight doesn't keep
  // treating "today" as future (or vice versa) based on a stale snapshot.
  const [todayKey, setTodayKey] = useState(() => getTodayKey());
  useEffect(() => {
    const interval = setInterval(() => setTodayKey(getTodayKey()), 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") setTodayKey(getTodayKey());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  async function loadHabit() {
    const data = await apiFetch<{ habits: Habit[] }>("/habits");
    const found = data.habits.find((h) => h.id === habitId) ?? null;
    if (!found) {
      setNotFound(true);
      return;
    }
    setHabit(found);
  }

  async function loadLogs() {
    const start = toUtcInstant(rangeStart.getFullYear(), rangeStart.getMonth(), rangeStart.getDate());
    const end = toUtcInstant(rangeEnd.getFullYear(), rangeEnd.getMonth(), rangeEnd.getDate());
    const data = await apiFetch<{ logs: HabitLog[] }>(
      `/logs?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
    );
    const keys = new Set(
      data.logs.filter((log) => log.habitId === habitId).map((log) => keyFromUtcIso(log.date))
    );
    setCheckedKeys(keys);
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([loadHabit(), loadLogs()])
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Failed to load habit"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [habitId]);

  async function handleToggle(cell: DayCell) {
    if (pendingKeys.has(cell.key)) return;

    // Re-check against "now" rather than the memoized grid's stale cutoff —
    // if the tab has been open since before midnight, cell.isFuture can be
    // wrong for what is actually today.
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (cell.date > now) {
      toast.error("You can't check in for a future date");
      return;
    }

    const wasChecked = checkedKeys.has(cell.key);

    setPendingKeys((prev) => new Set(prev).add(cell.key));
    setCheckedKeys((prev) => {
      const next = new Set(prev);
      if (wasChecked) next.delete(cell.key);
      else next.add(cell.key);
      return next;
    });

    try {
      await apiFetch<{ checked: boolean }>(`/habits/${habitId}/check`, {
        method: "POST",
        body: JSON.stringify({ date: toUtcInstant(cell.year, cell.month, cell.day) }),
      });
    } catch (err) {
      // revert optimistic update on failure
      setCheckedKeys((prev) => {
        const next = new Set(prev);
        if (wasChecked) next.add(cell.key);
        else next.delete(cell.key);
        return next;
      });
      toast.error(err instanceof ApiError ? err.message : "Failed to save check-in");
    } finally {
      setPendingKeys((prev) => {
        const next = new Set(prev);
        next.delete(cell.key);
        return next;
      });
    }
  }

  async function handleEdit(values: HabitFormValues) {
    await apiFetch(`/habits/${habitId}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    setShowEdit(false);
    toast.success("Habit updated");
    await loadHabit();
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiFetch(`/habits/${habitId}`, { method: "DELETE" });
      toast.success("Habit deleted");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete habit");
      setDeleting(false);
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">Habit not found.</p>
        <Link href="/dashboard" className="text-sm font-medium text-foreground underline underline-offset-4">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to habits
      </Link>

      {loading || !habit ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-14 w-full max-w-md" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{habit.name}</h1>
              {habit.description && (
                <p className="mt-1 text-sm text-muted-foreground">{habit.description}</p>
              )}
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5" />
                Since {new Date(habit.startDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowEdit(true)}>
                <Pencil />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setShowDelete(true)}>
                <Trash2 />
                Delete
              </Button>
            </div>
          </div>

          <Card>
            <CardContent>
              <Heatmap
                weeks={weeks}
                monthLabels={monthLabels}
                checkedKeys={checkedKeys}
                pendingKeys={pendingKeys}
                todayKey={todayKey}
                onToggle={handleToggle}
              />
            </CardContent>
          </Card>
        </>
      )}

      {habit && (
        <>
          <HabitFormModal
            open={showEdit}
            title="Edit habit"
            description="Update the details for this habit."
            submitLabel="Save changes"
            initialValues={habitToFormValues(habit)}
            onSubmit={handleEdit}
            onOpenChange={setShowEdit}
          />

          <ConfirmDialog
            open={showDelete}
            title="Delete habit"
            message={`Are you sure you want to delete "${habit.name}"? This will also delete all of its check-in history.`}
            confirmLabel="Delete"
            danger
            submitting={deleting}
            onConfirm={handleDelete}
            onOpenChange={setShowDelete}
          />
        </>
      )}
    </div>
  );
}

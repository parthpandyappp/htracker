"use client";

import Link from "next/link";
import { Pencil, Trash2, CalendarDays } from "lucide-react";
import { Habit } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function HabitCard({
  habit,
  onEdit,
  onDelete,
}: {
  habit: Habit;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex items-start justify-between gap-4">
        <Link href={`/habits/${habit.id}`} className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{habit.name}</p>
          {habit.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {habit.description}
            </p>
          )}
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            Since {new Date(habit.startDate).toLocaleDateString()}
          </p>
        </Link>
        <div className="flex shrink-0 gap-1.5">
          <Button variant="outline" size="icon-sm" onClick={onEdit} aria-label="Edit habit">
            <Pencil />
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={onDelete}
            aria-label="Delete habit"
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

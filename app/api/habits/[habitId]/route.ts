import { prisma } from "../../@lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requiresAuth } from "@/app/api/@utils/authUtils";
import { updateHabitSchema } from "@/app/api/@utils/validators";

export async function DELETE(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await requiresAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habit = await prisma.habit.findFirst({
      where: { id: params.habitId, userId },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // delete logs first
    await prisma.habitLog.deleteMany({
      where: { habitId: params.habitId },
    });

    await prisma.habit.delete({
      where: { id: params.habitId },
    });

    return NextResponse.json({ message: "Habit deleted" });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await requiresAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = updateHabitSchema.parse(await req.json());
    const data: { name?: string; description?: string; startDate?: Date } = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.startDate !== undefined) data.startDate = new Date(body.startDate);

    const updated = await prisma.habit.updateMany({
      where: {
        id: params.habitId,
        userId,
      },
      data,
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const habit = await prisma.habit.findUnique({ where: { id: params.habitId } });

    return NextResponse.json({ message: "Habit updated", habit });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

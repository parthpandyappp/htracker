import { prisma } from "../../@lib/prisma";
import { NextResponse } from "next/server";
import { requiresAuth } from "@/app/api/@utils/authUtils";

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

    const body = await req.json();
    const data: { name?: string; description?: string; startDate?: Date } = {};
    if (typeof body.name === "string") data.name = body.name;
    if (typeof body.description === "string") data.description = body.description;
    if (typeof body.startDate === "string") data.startDate = new Date(body.startDate);

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
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

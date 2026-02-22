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

    // delete logs first
    await prisma.habitLog.deleteMany({
      where: { habitId: params.habitId },
    });

    await prisma.habit.deleteMany({
      where: {
        id: params.habitId,
        userId,
      },
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
    const body = await req.json();

    const updated = await prisma.habit.updateMany({
      where: {
        id: params.habitId,
        userId,
      },
      data: body,
    });

    return NextResponse.json({ updated });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

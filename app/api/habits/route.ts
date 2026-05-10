import { prisma } from "../@lib/prisma";
import { NextResponse } from "next/server";
import { requiresAuth } from "../@utils/authUtils";
import { createHabitSchema } from "../@utils/validators";

export async function POST(req: Request) {
  try {
    const userId = await requiresAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = createHabitSchema.parse(await req.json());
    const { name, description, startDate } = body;

    const habit = await prisma.habit.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: null,
        userId,
      },
    });

    return NextResponse.json(
      { message: "Habit added", habit },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Failed to add habit" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = await requiresAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const habits = await prisma.habit.findMany({
      where: { userId },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ habits });
  } catch {
    return NextResponse.json(
      { error: "Failed to GET habits" },
      { status: 500 }
    );
  }
}

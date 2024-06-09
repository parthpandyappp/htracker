import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import { requiresAuth } from "../@utils/authUtils";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, description, startDate = new Date() } = await req.json();

    const userId = await requiresAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (typeof userId === "string") {
      const newHabit = await prisma.habit.create({
        data: {
          name,
          description,
          startDate,
          endDate: null,
          userId,
        },
      });

      return NextResponse.json(
        { message: "Habit added", habit: newHabit },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to add habit" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const userId = await requiresAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (typeof userId === "string") {
      const habits = await prisma.habit.findMany({
        where: { userId: userId },
      });

      return NextResponse.json({ habits }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to GET habits" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await requiresAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId } = await req.json();

    if (typeof userId === "string") {
      const habit = await prisma.habit.findUnique({
        where: { id: habitId },
      });

      if (!habit || habit.userId !== userId) {
        return NextResponse.json({ error: "Habit not found" }, { status: 404 });
      }

      await prisma.habit.delete({
        where: { id: habitId },
      });

      return NextResponse.json({ message: "Habit deleted" }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete habit" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await requiresAuth(req);

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { habitId, name, description, startDate, endDate } = await req.json();

    if (typeof userId === "string") {
      const habit = await prisma.habit.findUnique({
        where: { id: habitId },
      });

      if (!habit || habit.userId !== userId) {
        return NextResponse.json({ error: "Habit not found" }, { status: 404 });
      }

      const updatedHabit = await prisma.habit.update({
        where: { id: habitId },
        data: {
          name,
          description,
          startDate,
          endDate,
        },
      });

      return NextResponse.json(
        { message: "Habit updated", habit: updatedHabit },
        { status: 200 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update habit" },
      { status: 500 }
    );
  }
}

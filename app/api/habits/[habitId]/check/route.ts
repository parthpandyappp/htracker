import { NextResponse } from "next/server";
import { prisma } from "@/app/api/@lib/prisma";
import { requiresAuth } from "@/app/api/@utils/authUtils";
import { checkInSchema } from "@/app/api/@utils/validators";

export async function POST(
  req: Request,
  { params }: { params: { habitId: string } }
) {
  try {
    const userId = await requiresAuth(req);
    console.log({ userId });
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = checkInSchema.parse(await req.json());

    const raw = body.date ? new Date(body.date) : new Date();

    // ⭐ normalize to day
    const date = new Date(raw);
    date.setHours(0, 0, 0, 0);

    const habit = await prisma.habit.findFirst({
      where: { id: params.habitId, userId },
    });

    if (!habit)
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });

    // ⭐ use upsert instead of manual find/delete
    const existing = await prisma.habitLog.findFirst({
      where: { habitId: params.habitId, date },
    });

    if (existing) {
      await prisma.habitLog.delete({ where: { id: existing.id } });
      return NextResponse.json({ checked: false });
    }

    await prisma.habitLog.create({
      data: {
        habitId: params.habitId,
        date,
        value: 1,
      },
    });

    return NextResponse.json({ checked: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}

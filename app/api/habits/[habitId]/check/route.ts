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
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = checkInSchema.parse(await req.json());

    const raw = body.date ? new Date(body.date) : new Date();

    // Normalize to a UTC-midnight instant so day boundaries are unambiguous
    // regardless of the server's local timezone.
    const date = new Date(
      Date.UTC(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate())
    );

    const today = new Date();
    const todayUtc = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
    // Allow one extra UTC day of slack: a client in a timezone ahead of UTC
    // (e.g. IST) can have a "today" that is already tomorrow in UTC terms.
    // Without this, a genuine same-day check-in gets misclassified as future.
    const maxAllowedDate = new Date(todayUtc);
    maxAllowedDate.setUTCDate(maxAllowedDate.getUTCDate() + 1);

    if (date > maxAllowedDate) {
      return NextResponse.json(
        { error: "You can't check in for a future date" },
        { status: 400 }
      );
    }

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

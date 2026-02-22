import { prisma } from "../@lib/prisma";
import { NextResponse } from "next/server";
import { requiresAuth } from "@/app/api/@utils/authUtils";

export async function GET(req: Request) {
  try {
    const userId = await requiresAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const start = new Date(searchParams.get("start")!);
    const end = new Date(searchParams.get("end")!);

    const logs = await prisma.habitLog.findMany({
      where: {
        habit: {
          userId,
        },
        date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        habit: true,
      },
    });

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

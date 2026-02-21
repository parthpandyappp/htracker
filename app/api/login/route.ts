import bcrypt from "bcryptjs";
const sign = require("jwt-encode");
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const foundUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!foundUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordMatch = await bcrypt.compare(password, foundUser.password);

    if (passwordMatch) {
      const encodedToken = sign(
        { username: foundUser.username, email: foundUser.email },
        process.env.JWT_SECRET
      );
      return NextResponse.json(
        { message: "Login successful", user: foundUser, encodedToken },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}

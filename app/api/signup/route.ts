import bcrypt from "bcryptjs";
const sign = require("jwt-encode");
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    console.log({ newUser });

    const userId = newUser.id;
    const encodedToken = sign(
      { userId, username, email },
      process.env.JWT_SECRET
    );

    // Example: Pushing a default habit for the user
    // const defaultHabit = await prisma.habit.create({
    //   data: {
    //     name: "Example Habit",
    //     description: "This is an example habit",
    //     startDate: new Date(),
    //     endDate: new Date(),
    //     userId: userId,
    //   },
    // });

    return NextResponse.json(
      { message: "User created successfully", user: newUser, encodedToken },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

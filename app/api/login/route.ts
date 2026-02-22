import bcrypt from "bcryptjs";
var jwt = require("jsonwebtoken");
import { prisma } from "../@lib/prisma";

import { NextResponse } from "next/server";

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
      const encodedToken = jwt.sign(
        { userId: foundUser.id },
        process.env.JWT_SECRET
      );

      const { password, ...safeUser } = foundUser;

      return NextResponse.json(
        { message: "Login successful", user: safeUser, encodedToken },
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

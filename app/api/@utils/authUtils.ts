import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

var jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

export const requiresAuth = async (
  req: any
): Promise<NextResponse | string | undefined> => {
  try {
    const authorizationHeader = req.headers.get("authorization");
    if (!authorizationHeader) {
      return NextResponse.json(
        { error: "Authorization header is missing" },
        { status: 401 }
      );
    }

    const encodedToken = authorizationHeader.split(" ")[1];
    if (!encodedToken) {
      return NextResponse.json({ error: "Token is missing" }, { status: 401 });
    }

    const decodedToken = jwt.verify(encodedToken, process.env.JWT_SECRET);
    if (decodedToken) {
      const user = await prisma.user.findUnique({
        where: { username: decodedToken.username },
      });
      if (user) {
        return user.id;
      }
    }

    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to authenticate" },
      { status: 500 }
    );
  }
};

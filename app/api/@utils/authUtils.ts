import jwt from "jsonwebtoken";

export async function requiresAuth(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");

  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    return decoded.userId;
  } catch {
    return null;
  }
}

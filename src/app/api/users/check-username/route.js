import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return Response.json({ error: "Username is required" }, { status: 400 });
    }

    await connectToDatabase();

    // Check if username already exists under profile.username
    const existingUser = await User.findOne({
      "profile.username": username.trim(),
    });

    return Response.json({
      available: !existingUser,
      username: username.trim(),
    });
  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

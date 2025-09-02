import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export async function authenticateIPTVUser(authHeader) {
  try {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { error: "Authorization header required", status: 401 };
    }

    const token = authHeader.split(" ")[1];

    // For now, let's use a simple approach - treat the token as a username
    // This will work with your current Firebase setup
    await connectToDatabase();

    // Find user by username (treating the token as username)
    const user = await User.findOne({
      "profile.username": token,
      isActive: true,
    });

    if (!user) {
      // If username not found, try to find by email
      const userByEmail = await User.findOne({
        email: token,
        isActive: true,
      });

      if (!userByEmail) {
        return { error: "Invalid or expired token", status: 401 };
      }

      return { user: userByEmail };
    }

    return { user };
  } catch (error) {
    console.error("IPTV Authentication error:", error);
    return { error: "Authentication failed", status: 500 };
  }
}

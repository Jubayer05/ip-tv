import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    await connectToDatabase();
    const { id } = (await params) || {};
    if (!id) {
      return NextResponse.json(
        { error: "User id is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const amountToAdd = Number(body?.amountToAdd ?? 0);
    const setTo = body?.setTo;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (setTo !== undefined && setTo !== null) {
      user.balance = Number(setTo);
    } else {
      user.balance =
        Number(user.balance || 0) +
        (Number.isFinite(amountToAdd) ? amountToAdd : 0);
    }

    await user.save();
    return NextResponse.json({ success: true, balance: user.balance });
  } catch (e) {
    console.error("Balance update error:", e);
    return NextResponse.json(
      { error: "Failed to update balance", details: e.message },
      { status: 500 }
    );
  }
}

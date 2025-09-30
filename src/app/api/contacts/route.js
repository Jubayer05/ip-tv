import { connectToDatabase } from "@/lib/db";
import { sendContactFormEmail } from "@/lib/email";
import Contact from "@/models/Contact";
import Settings from "@/models/Settings";
import { NextResponse } from "next/server";

// Helper function to verify reCAPTCHA
async function verifyRecaptcha(token) {
  try {
    // Get reCAPTCHA secret key from database
    const settings = await Settings.getSettings();
    const secretKey = settings?.apiKeys?.recaptcha?.secretKey;

    if (!secretKey) {
      console.error("reCAPTCHA secret key not found in database settings");
      return false;
    }

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    console.log("reCAPTCHA verification response:", data);
    return data.success;
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return false;
  }
}

// GET - Fetch all contacts with filtering
export async function GET(request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const search = searchParams.get("search");

    // Build filter object
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (priority && priority !== "all") {
      filter.priority = priority;
    }
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get contacts with pagination
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Contact.countDocuments(filter);

    // Get statistics
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const statsObj = {
      total: total,
      open: 0,
      closed: 0,
    };

    stats.forEach((stat) => {
      statsObj[stat._id] = stat.count;
    });

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: statsObj,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST - Create new contact
export async function POST(request) {
  try {
    await connectToDatabase();

    const body = await request.json();
    console.log("Received contact form data:", body);

    const { firstName, lastName, email, subject, description, recaptchaToken } =
      body;

    // Validate required fields
    if (!firstName || !lastName || !email || !subject || !description) {
      console.log("Missing required fields:", {
        firstName,
        lastName,
        email,
        subject,
        description,
      });
      return NextResponse.json(
        { success: false, error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify reCAPTCHA if token is provided
    if (recaptchaToken) {
      console.log("Verifying reCAPTCHA token...");
      const recaptchaValid = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaValid) {
        console.log("reCAPTCHA verification failed");
        return NextResponse.json(
          { success: false, error: "reCAPTCHA verification failed" },
          { status: 400 }
        );
      }
      console.log("reCAPTCHA verification successful");
    } else {
      console.log("No reCAPTCHA token provided, skipping verification");
    }

    // Create new contact
    const contact = new Contact({
      firstName,
      lastName,
      email,
      subject,
      description,
    });

    await contact.save();
    console.log("Contact saved successfully:", contact._id);

    // Send email notification to admin
    try {
      await sendContactFormEmail({
        firstName,
        lastName,
        email,
        subject,
        description,
      });
      console.log("Contact form email sent successfully");
    } catch (emailError) {
      console.error("Failed to send contact form email:", emailError);
      // Don't fail the request if email sending fails
    }

    return NextResponse.json({
      success: true,
      data: contact,
      message: "Contact request submitted successfully",
    });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create contact" },
      { status: 500 }
    );
  }
}

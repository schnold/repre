// src/app/api/user/onboarding/route.ts
import { NextResponse } from "next/server";
import { getSession } from "@auth0/nextjs-auth0";
import { User, Organization, Teacher } from "@/lib/db/schemas";
import { connectToDatabase } from "@/lib/db/mongoose";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    await connectToDatabase();

    // Get or create user
    let user = await User.findOne({ auth0Id: session.user.sub });
    if (!user) {
      user = await User.create({
        auth0Id: session.user.sub,
        email: session.user.email,
        name: session.user.name || session.user.email,
        roles: [data.role],
      });
    }

    if (data.role === "school-admin") {
      // Create organization
      const organization = await Organization.create({
        name: data.organizationName,
        type: data.organizationType,
        settings: {
          timezone: "UTC", // Default timezone
          workingDays: [1, 2, 3, 4, 5], // Monday to Friday by default
          defaultWorkingHours: {
            start: "09:00",
            end: "17:00",
          },
        },
      });

      // Update user with organization
      await User.findByIdAndUpdate(user._id, {
        organizationId: organization._id,
      });
    } else if (data.role === "teacher" || data.role === "substitute") {
      // Create teacher profile
      await Teacher.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        position: data.position,
        subjects: data.subjects,
        status: data.role === "teacher" ? "active" : "substitute",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to process onboarding" },
      { status: 500 }
    );
  }
}
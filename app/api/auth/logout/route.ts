import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    // List of cookies to clear
    const cookiesToClear = [
      "qrobotics_user",
      "qrobotics_role", 
      "qrobotics_session",
      "qrobotics_admin_session",
    ];

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 }
    );

    // Clear all auth-related cookies
    cookiesToClear.forEach(cookieName => {
      if (cookieStore.get(cookieName)) {
        response.cookies.set(cookieName, "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 0, // This expires the cookie immediately
          path: "/",
        });
      }
    });

    return response;

  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout failed" },
      { status: 500 }
    );
  }
}

//src/app/api/auth/login/route.js

/**
 * Your login APIs go here
 */
import corsHeaders from "@/lib/cors";
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse } from "@/lib/utils";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = process.env.DB_NAME;
export async function OPTIONS() {
  return new Response(null, { status: 200, headers: corsHeaders });
}
export async function POST(req) {
  const data = await req.json();
  const { email, password } = data;

  if (!email || !password) {
    return errorResponse("Missing email or password", 400);
  }

  const user = await checkUser(email, password);


  if (user) {
    // Generate JWT
    const token = getJwtToken(user);

    // Set JWT as HTTP-only cookie
    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            role: user.role,
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV == "development" ? "lax" : "none",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } else {
    return errorResponse("Invalid email or password", 401);
  }
}


async function checkUser(email, password) {
  try {
    const client = await getClientPromise();
    const db = client.db(DB_NAME);
    const user = await db.collection("users").findOne({ email });

    if (!user) return false;

    const check = await bcrypt.compare(password, user.password);

    if (!check) {
      return false;
    } else return user;
  } catch (error) {
    console.log("exception", error.toString());
    return false;
  }
}

function getJwtToken(user) {
  const token = jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  );

  return token;
}
//src/app/api/user/route.js
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";
import corsHeaders from "@/lib/cors";
import bcrypt from "bcrypt";
/**
 * User API endpoints go here
 */
export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders
    })
}

export async function POST(request) {
// username email password role
    try {
        const hashPassword = await bcrypt.hash(password, 10);
        const data = await request.json();
        const username = data.username;
        const email = data.email;
        const password = data.password;
        const role = data.role;
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);
        const insertResult = await db.collection("users").insertOne({
            username: username,
            email: email,
            password: password,
            role: role,
        });

        return successResponse(
            {
                id: insertResult.insertedId,
            },
            201,
        );
    } catch (error) {
        printExceptionLog("POST Users", error);
        return errorResponse("POST User Internal Error", 500);
    }
}

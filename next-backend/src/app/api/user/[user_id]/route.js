//src/app/api/user/[user_id]/route.js
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";
import corsHeaders from "@/lib/cors";
/**
 * Specific user id endpoints go here
 */

export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders
    })
}
export async function GET(request, { params }) {
    const { user_id } = await params;
    try {
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);
        const user = await db.collection("users").findOne({ _id: new ObjectId(user_id)});

        if (user) {
            return successResponse(
                {
                    user,
                },

                200,
            );
        } else return errorResponse("User not found", 404);
    }
    catch (error) {
        printExceptionLog("GET User Exception", error);
        return errorResponse("GET User Internal Error", 500);
    }
}

export async function DELETE(request, { params }) {
    const { user_id } = await params;

    try {
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);
        const deleteResult = await db.collection("users").deleteOne({ _id: new ObjectId(user_id)});

        if (deleteResult.deletedCount === 0) {
            return errorResponse("User not found", 404);
        }   
        return successResponse({message: "Delete Success"}, 200);
    }
    catch (error) {
        printExceptionLog("DELETE User Exception", error);
        return errorResponse("DELETE User Internal Error", 500);
    }
}

export async function PUT(request, { params }) {
    const { user_id } = await params;

    console.log("==> user data id: ", user_id);

    try {
        const data = await request.json();
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);
        const storedUser = await db.collection("users").findOne({ _id: new ObjectId(user_id)});
        // username email password role
        if (storedUser) {
            storedUser.username = data.username;
            storedUser.email = data.email;
            storedUser.password = data.password;
            storedUser.role = data.role;

            const updatedResult = await db.collection("users").updateOne({ _id: new ObjectId(user_id)},
            { $set: storedUser});
            console.log("==>update result: ", updatedResult);
            const updateOk = Number(updatedResult.matchedCount) > 0;

            if (updateOk)
                return successResponse({ message: "User update success"}, 200);
            else return errorResponse("User update failed", 400);
        } else {
            return errorResponse("User not found", 404);
        } 
    }   catch (error) {
            printExceptionLog("PUT User Exception", error);
            return errorResponse("PUT User Internal Error", 500);
        }
}

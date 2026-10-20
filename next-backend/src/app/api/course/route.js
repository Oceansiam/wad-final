//src/app/api/course/route.js
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";
import corsHeaders from "@/lib/cors";
/**
 * Course endpoints go here
 */
export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders
    })
}

export async function POST(request) {
// Course Name, Durations(Days) Topic(multiple topics), Price, Max Student, and Status
    try {
        const userId = request.headers.get("x-user-id");
        if (!userId) return errorResponse("Unauthorized", 401);
        const data = await request.json();
        const course_name = data.course_name;
        const duration_days = Number(data.duration_days);
        const topics = data.topics;
        const price = Number(data.price);
        const max_student = Number(data.max_student);
        const status = data.status;
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);
        const insertResult = await db.collection("courses").insertOne({
            course_name: course_name,
            duration_days: duration_days,
            topics: topics,
            price: price,
            max_student: max_student,
            status: status,
            teacher_id: new ObjectId(request.headers.get("x-user-id")),
            enrolled_students: [],
        });

        return successResponse(
            {
                id: insertResult.insertedId,
            },
            201,
        );
    } catch (error) {
        printExceptionLog("POST Course", error);
        return errorResponse("POST Course Internal Error", 500);
    }
}

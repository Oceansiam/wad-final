//src/app/api/course/[course_id]/route.js
import { getClientPromise } from "@/lib/mongodb";
import { errorResponse, printExceptionLog, successResponse } from "@/lib/utils";
import { ObjectId } from "mongodb";
import corsHeaders from "@/lib/cors";
/**
 * Specific course id API endpoints go here.
 */
export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: corsHeaders
    })
}
export async function GET(request, { params }) {
    const { course_id } = await params;
    try {
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);
        const course = await db.collection("courses").findOne({ _id: new ObjectId(course_id)});

        if (course) {
            return successResponse(
                {
                    course,
                },

                200,
            );
        } else return errorResponse("Course not found", 404);
    }
    catch (error) {
        printExceptionLog("GET Course Exception", error);
        return errorResponse("GET Course Internal Error", 500);
    }
}

export async function DELETE(request, { params }) {
    const { course_id } = await params;

    try {
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);
        const deleteResult = await db.collection("courses").deleteOne({ _id: new ObjectId(course_id)});

        if (deleteResult.deletedCount === 0) {
            return errorResponse("Course not found", 404);
        }   
        return successResponse({message: "Delete Success"}, 200);
    }
    catch (error) {
        printExceptionLog("DELETE Course Exception", error);
        return errorResponse("DELETE Course Internal Error", 500);
    }
}

export async function PUT(request, { params }) {
    const { course_id } = await params;

    console.log("==> course data id: ", course_id);
// Course Name, Durations(Days) Topic(multiple topics), Price, Max Student, and Status
    try {
        const data = await request.json();
        const client = await getClientPromise();
        const db = client.db(process.env.DB_NAME);
        const storedCourse = await db.collection("courses").findOne({ _id: new ObjectId(course_id)});
        if (storedCourse) {
            storedCourse.course_name = data.course_name;
            storedCourse.duration_days = Number(data.duration_days);
            storedCourse.topics = data.topics;
            storedCourse.price = Number(data.price);
            storedCourse.max_student = Number(data.max_student);
            storedCourse.status = data.status;

            const updatedResult = await db.collection("courses").updateOne({ _id: new ObjectId(course_id)},
            { $set: storedCourse});
            console.log("==>update result: ", updatedResult);
            const updateOk = Number(updatedResult.matchedCount) > 0;

            if (updateOk)
                return successResponse({ message: "Course update success"}, 200);
            else return errorResponse("Course update failed", 400);
        } else {
            return errorResponse("Course not found", 404);
        } 
    }   catch (error) {
            printExceptionLog("PUT Course Exception", error);
            return errorResponse("PUT Course Internal Error", 500);
        }
}

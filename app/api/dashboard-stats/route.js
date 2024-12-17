import connectToDB from "@/database"; // DB connection
import Job from "@/models/job"; // Job model
import Application from "@/models/application"; // Application model
import { NextResponse } from "next/server"; // Next.js response

export const dynamic = "force-dynamic";

export async function GET(req) {
    try {
        await connectToDB();

        // Aggregation pipeline
        const stats = await Job.aggregate([
            {
                $lookup: {
                    from: "applications", // The collection name for applications
                    localField: "_id", // Field from the jobs collection
                    foreignField: "job", // Field from the applications collection that references the job
                    as: "applications" // Create a new field "applications" with the matched documents
                }
            },
            {
                $group: {
                    _id: null, // Group by null to return a single document
                    totalJobPosts: { $sum: 1 }, // Count total job posts
                    totalViews: { $sum: { $size: { $ifNull: ["$views", []] } } }, // Assuming views are stored in another model, summing it will require a lookup. Here, we assume that each job might also have an array of views, otherwise adjust accordingly.
                    totalApplicants: { $sum: { $size: "$applications" } }, // Count total applicants
                    totalShortlists: { 
                        $sum: {
                            $size: {
                                $filter: {
                                    input: "$applications",
                                    as: "application",
                                    cond: { $eq: ["$$application.status", "shortlisted"] } // Count only shortlisted applications
                                }
                            }
                        }
                    },
                    totalHirings: { 
                        $sum: {
                            $size: {
                                $filter: {
                                    input: "$applications",
                                    as: "application",
                                    cond: { $eq: ["$$application.status", "hired"] } // Count only hired applications
                                }
                            }
                        }
                    }
                }
            }
        ]);
            
     
        // Handle the case where no stats are found
        if (stats.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    totalJobPosts: 0,
                    totalViews: 0,
                    totalApplicants: 0,
                    totalShortlists: 0,
                    totalHirings: 0,
                },
            });
        }

        // Return the computed statistics
        return NextResponse.json({
            success: true,
            data: stats[0], // Return the first document which contains the aggregated stats
        });

    } catch (error) {
       
        return NextResponse.json({
            success: false,
            message: "An error occurred while retrieving job statistics. Please try again.",
        });
    }
}

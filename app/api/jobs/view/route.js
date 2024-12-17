import connectToDb from '@/database';
import Job from "@/models/job";
import { NextResponse } from 'next/server';

export async function POST(req) {
  await connectToDb();

  try {
    const { userId, jobId } = await req.json();

    if (!userId || !jobId) {
      return NextResponse.json(
        { success: false, message: 'Missing userId or jobId' },
        { status: 400 }
      );
    }

    // Atomically add userId to views and increment viewCount if not already present
    const result = await Job.findByIdAndUpdate(
      jobId,
      {
        $addToSet: { views: userId }, // Add userId only if it doesn't exist
        $inc: { viewCount: 1 },      // Increment viewCount
      },
      { new: true } // Return the updated document
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'View count updated',
      viewCount: result.viewCount,
    });
  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

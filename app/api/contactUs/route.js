import connectToDb from '@/database'; // Ensure correct import path
import ContactUs from '@/models/contactUs'; // Ensure correct import path
import { NextResponse } from 'next/server';

export async function POST(req) {
  // Parse the incoming request body
  const { name, email, message } = await req.json();

  // Ensure DB connection
  await connectToDb();

  // Validate required fields
  if (!email || !message) {
    return NextResponse.json(
      { error: "Email and message are required." },
      { status: 400 }
    );
  }

  try {
    // Create a new message entry
    const newMessage = new ContactUs({
      name,
      email,
      message,
    });

    // Save the message to the database
    await newMessage.save();

    // Return success response
    return NextResponse.json({ message: "Message sent successfully!" });
  } catch (error) {
    // Handle errors
    return NextResponse.json({ error: "An error occurred while sending the message." }, { status: 500 });
  }
}

// import { NextResponse } from "next/server";
// import connectToDB from "../../../../database/index"; // DB connection function
// import Conversation from "../../../../models/conversation";
// import Message from "../../../../models/message";

// export const dynamic = "force-dynamic";

// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const sender = searchParams.get("sender");

//   if (!sender) {
//     return NextResponse.json(
//       { success: false, message: "Sender ID is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     // Establish DB connection
//     await connectToDB();

//     // Fetch conversations where sender is a participant
//     const conversations = await Conversation.find({ participants: sender })
//       .populate("participants", "fullName avatar") // Populate participant details
//       .populate({
//         path: "messages",
//         options: { sort: { created_at: -1 }, limit: 1 }, // Fetch only the last message
//         populate: {
//           path: "from to",
//           select: "fullName avatar",
//         },
//       });

//     // Prepare response with the last message and unseen count
//     const conversationsWithDetails = conversations.map((conversation) => {
//       // Extract unseen messages count for the sender
//       const unseenMessages = conversation.unseenMessages.get(sender) || [];
//       const unseenCount = unseenMessages.length;

//       // Get the last message (populated with limit=1)
//       const lastMessage =
//         conversation.messages.length > 0 ? conversation.messages[0] : null;


//       return {
//         conversationId: conversation._id,
//         groupName: conversation.groupName || null,
//         participants: conversation.participants.filter(
//           (participant) => participant._id.toString() !== sender
//         ), // Exclude sender from participants
//         lastMessage,
//         unseenCount,
//       };
//     });
      



//     return NextResponse.json({ success: true, data: conversationsWithDetails });
//   } catch (error) {
//     console.error("Error fetching conversations:", error);
//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import connectToDB from "../../../../database/index"; // DB connection function
import Conversation from "../../../../models/conversation";
import Message from "../../../../models/message";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const sender = searchParams.get("sender");
  const page = parseInt(searchParams.get("page")) || 1; // Default to page 1
  const limit = 10; // Number of conversations per page
  const skip = (page - 1) * limit;

  if (!sender) {
    return NextResponse.json(
      { success: false, message: "Sender ID is required" },
      { status: 400 }
    );
  }

  try {
    // Establish DB connection
    await connectToDB();

    // Fetch total conversation count for pagination
    const totalConversations = await Conversation.countDocuments({
      participants: sender,
    });

    // Fetch paginated conversations where sender is a participant
    const conversations = await Conversation.find({ participants: sender })
      .populate("participants", "fullName avatar") // Populate participant details
      .populate({
        path: "messages",
        options: { sort: { created_at: -1 }, limit: 1 }, // Fetch only the last message
        populate: {
          path: "from to",
          select: "fullName avatar",
        },
      })
      .skip(skip)
      .limit(limit);

    // Prepare response with the last message and unseen count
    const conversationsWithDetails = conversations.map((conversation) => {
      // Extract unseen messages count for the sender
      const unseenMessages = conversation.unseenMessages.get(sender) || [];
      const unseenCount = unseenMessages.length;

      // Get the last message (populated with limit=1)
      const lastMessage =
        conversation.messages.length > 0 ? conversation.messages[0] : null;

      return {
        conversationId: conversation._id,
        groupName: conversation.groupName || null,
        groupPic:conversation.groupPic || null,
        participants: conversation.participants,
        lastMessage,
        unseenCount,
      };
    });

    // Calculate total pages
    const totalPages = Math.ceil(totalConversations / limit);

    return NextResponse.json({
      success: true,
      data: conversationsWithDetails,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

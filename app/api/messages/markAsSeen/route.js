

import { NextResponse } from "next/server";
import connectToDB from "../../../../database/index";
import Conversation from "../../../../models/conversation";
import Message from "../../../../models/message";
import { User } from "@/models/user";

export async function PUT(req) {
  try {
    await connectToDB();

    const { conversationId, userId } = await req.json();

    if (!conversationId || !userId) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find the conversation
    const conversation = await Conversation.findById(conversationId).populate("messages");

    if (!conversation) {
      return NextResponse.json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Get unseen message IDs for the specific user
    const unseenMessageIds = conversation.unseenMessages.get(userId) || [];

    if (unseenMessageIds.length === 0) {
      // Calculate remaining unseen messages count for the conversation
      const unseenMessCount = Array.from(conversation.unseenMessages.values()).reduce(
        (total, userMessages) => total + userMessages.length,
        0
      );

      return NextResponse.json({
        success: true,
        message: "No unseen messages for the user",
        unseenMessCount,
        unseenMessageIds: [],
        seenByUsers: [],
      });
    }

    // Update the unseen messages as seen by the specific user
    const updatedMessages = [];
    const seenByUsersDetails = [];
    for (const messageId of unseenMessageIds) {
      const message = await Message.findById(messageId);

      if (message) {
        if (!message.seenByUsers.includes(userId)) {
          message.seenByUsers.push(userId); // Add userId to seenByUsers array
        }
        await message.save();
        updatedMessages.push({
          _id: message._id,
          seenByUsers: message.seenByUsers,
        });

        // Populate seenByUsers details for each message
        const seenByUsersData = await Promise.all(
          message.seenByUsers.map(async (seenUserId) => {
            const user = await User.findById(seenUserId); // Assuming a User model exists
            return {
              _id: seenUserId,
              fullName: user.fullName, // Populate fullName
              avatar: user.avatar,    // Populate avatar
            };
          })
        );
        seenByUsersDetails.push(...seenByUsersData);
      }
    }

    // Clear unseen messages for the user
    conversation.unseenMessages.set(userId, []);

    // Save the updated conversation
    await conversation.save();

    // Calculate remaining unseen messages count for the conversation
    const unseenMessCount = Array.from(conversation.unseenMessages.values()).reduce(
      (total, userMessages) => total + userMessages.length,
      0
    );

    return NextResponse.json({
      success: true,
      message: "Messages marked as seen successfully",
      unseenMessCount,
      unseenMessageIds,
      seenByUsers: seenByUsersDetails, // Include user details for seen messages
    });
  } catch (error) {
    console.error("Error in marking messages as seen:", error);
    return NextResponse.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}

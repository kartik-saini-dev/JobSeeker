
import { createServer } from 'http';
import next from 'next';
import { Server } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.BASE_URL,
      methods: ['GET', 'POST', 'Delete', 'PUT'],
    },
  });

  const usersInRoom = new Map();
  const onlineUsers = new Map();


  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    socket.on('setup', ({ userId }) => setupUser(userId, socket));
    socket.on('joinRoom', ({ userRoom, userId }) => joinRoom(userRoom, userId, socket));
    socket.on('message', (messageData) => handleMessage(messageData, socket));
    socket.on('updateMessage', ({ messageId, updatedText, userRoom, sender, participants, conversationId, groupName, isGroup }) => updateMessage(messageId, sender, participants, conversationId, groupName, isGroup, updatedText, userRoom, socket));
    socket.on('deleteMessage', ({ messageId, userRoom, sender, participants, conversationId, isGroup }) => deleteMessage(messageId, sender, participants, conversationId, isGroup, userRoom, socket));
    socket.on('markAsSeen', ({ userId, conversationId }) => markAsSeen(userId, conversationId, socket));
    socket.on('disconnect', () => handleDisconnect(socket));
    socket.on('leaveRoom', ({ userRoom, userId }) => {
      disconnectFromRoom(userRoom, userId, socket);
    });
    // Listen for typing event
    socket.on("typing", ({ room, userId, userName }) => {
      // Emit to all clients in the room except the sender
      socket.to(room).emit("userTyping", { userId, userName });
    });

    // Listen for stopTyping event
    socket.on("stopTyping", ({ room, userId, userName }) => {
      // Emit to all clients in the room except the sender
      socket.to(room).emit("userStoppedTyping", { userId, userName });
    });
  });



  function setupUser(userId, socket) {
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, { socketId: socket.id });
    } else {
      const existingSocketId = onlineUsers.get(userId).socketId;
      if (existingSocketId !== socket.id) {
        onlineUsers.set(userId, { socketId: socket.id });
      }
    }
  }

  function joinRoom(userRoom, userId, socket) {

    if (socket.userRoom) {
      disconnectFromRoom(socket.userRoom, socket.userId, socket);
    }

    socket.join(userRoom);
    socket.userRoom = userRoom;
    socket.userId = userId;
    console.log("this user", userId, "has joined the room")
    if (!usersInRoom.has(userRoom)) {
      usersInRoom.set(userRoom, { participants: [] });
    }

    const participants = usersInRoom.get(userRoom).participants;

    if (!participants.includes(userId)) {
      participants.push(userId);
    }
  }

  async function handleMessage({
    message,
    from,
    type,
    userRoom,
    createdAt,
    isGroup,
    groupName,
    conversationId,
    participants,
  }, socket) {
    try {
      const messageData = {
        from,
        message,
        type,
        createdAt,
        isGroup,
        groupName,
        conversationId,
      };
      let seenBy = [];

      // For group messages: get users from usersInRoom
      const roomParticipants = usersInRoom.get(userRoom)?.participants || [];

      roomParticipants.forEach((userId) => {
        if (usersInRoom.get(userRoom)?.participants.includes(userId)) {
          seenBy.push(userId); // Mark as seen if user is in the room
        }
      });

      // Save the message to the backend with seen information
      const response = await fetch(`${process.env.BASE_URL}/api/messages/post`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...messageData,
          to: isGroup
            ? conversationId
            : participants.find((p) => p._id !== from)._id,
          seenBy, // Users who have seen the message
        }),
      });

      const responseData = await response.json();

      if (responseData.success) {
        const savedMessage = responseData.message; // The saved message
        const unseenMessageCounts = responseData.unseenMessageCounts || {}; // Unseen count

        // Emit the message event to the room
        io.to(userRoom).emit("sendmessage", {
          _id: savedMessage._id,
          from,
          to: isGroup
            ? conversationId
            : participants.find((p) => p._id !== from)._id,
          text: savedMessage.text,
          created_at: savedMessage.created_at,
          seenByUsers: savedMessage.seenByUsers,
          type,
        });

        // Create recipients array for a single recipient
        const recipients = [participants.find((p) => p._id !== from)?._id]; // Add the single recipient

        // Emit unseenReceived for the single recipient
        recipients.forEach((recipientId) => {
          if (recipientId && onlineUsers.has(recipientId)) {
            const recipientSocket = onlineUsers.get(recipientId)?.socketId;
            const unseenCount = unseenMessageCounts[recipientId]?.length || 0;

            if (!seenBy.includes(recipientId)) {
              socket.to(recipientSocket).emit("unseenReceived", {
                count: unseenCount,
                to: recipientId,
                from: conversationId,
              });
            }
          }
        });


      } else {
        console.error("Failed to save message:", responseData.message);
      }
    } catch (error) {
      console.error("Error in handleMessage:", error);
    }
  }


  async function updateMessage(
    messageId,
    sender,
    participants,
    conversationId,
    groupName,
    isGroup,
    updatedText,
    userRoom,
    socket) {
    try {
      // Determine the receiver based on group or individual conversation
      const receiver = isGroup
        ? conversationId // For group conversations
        : participants.find((p) => p._id !== sender)._id; // For individual conversations

      // Prepare the API call URL and data payload
      const url = `${process.env.BASE_URL}/api/messages/update/?conversationId=${conversationId}&messageId=${messageId}&sender=${sender}`;
      const data = {
        text: updatedText,
        isGroup,
        groupName,
        receiver, // Dynamic receiver based on conversation type
        participants,
      };

      // API call to update the message
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success) {
          const updatedMessage = responseData.updatedMessage; // Updated message from the backend

          // Emit the updated message to the room
          io.to(userRoom).emit("messageUpdated", {
            messageId: updatedMessage._id,
            updatedText: updatedMessage.text,
          });
        } else {
          console.error("Failed to update message:", responseData.message);
        }
      } else {
        console.error("Failed to update message: API call error");
      }
    } catch (error) {
      console.error("Error in updateMessage:", error);
    }
  }

  async function deleteMessage(messageId,
    sender,
    participants,
    conversationId,
    isGroup,
    userRoom,
    socket) {

    try {

      let seenBy = [];

      // For group messages: get users from usersInRoom
      const roomParticipants = usersInRoom.get(userRoom)?.participants || [];

      roomParticipants.forEach((userId) => {
        if (usersInRoom.get(userRoom)?.participants.includes(userId)) {
          seenBy.push(userId); // Mark as seen if user is in the room
        }
      });

      // Determine the receiver for individual conversations
      const receiver = isGroup
        ? conversationId // For group chats
        : participants.find((p) => p._id !== sender)?._id;

      console.log(receiver, "this is participants", participants)
      // Prepare the API call URL
      const url = `${process.env.BASE_URL}/api/messages/delete/?receiverId=${receiver}&isGroup=${isGroup}&messageId=${messageId}&sender=${sender}&conversationId=${conversationId}`;

      // API call to delete the message
      const response = await fetch(url, {
        method: "DELETE",
      });

      if (response.ok) {
        const data = await response.json(); // Parse response JSON

        if (data.success) {
          const unseenCount = data.unseenMessCount || 0;

          // Emit the delete event to all users in the room
          io.to(userRoom).emit("messageDeleted", { messageId });
          console.log(`Message ${messageId} deleted in room ${userRoom}`);

          // Handle unseen count updates for individual conversations
          // if (receiver && onlineUsers.has(receiver)) {
          //   const receiverSocketId = onlineUsers.get(receiver).socketId;
          //   socket.to(receiverSocketId).emit("unseenReceived", {
          //     count: unseenCount,
          //     to: receiver,
          //     from: sender,
          //   });
          // }
          // Create recipients array for a single recipient
          
          const recipients = [participants.find((p) => p._id !== sender)?._id]; // Add the single recipient
             console.log(unseenCount,"thi delete")
          // Emit unseenReceived for the single recipient
          recipients.forEach((recipientId) => {
            if (recipientId && onlineUsers.has(recipientId)) {
              const recipientSocket = onlineUsers.get(recipientId)?.socketId;
        
              if (!seenBy.includes(recipientId)) {
                socket.to(recipientSocket).emit("unseenReceived", {
                  count: unseenCount,
                  to: recipientId,
                  from: conversationId,
                });
              }
            }
          });

        } else {
          console.error("Failed to delete message:", data.message);
        }
      } else {
        console.error("Error deleting message: API call error");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  }

  // Server-side markAsSeen
  const markAsSeen = async (userId, conversationId) => {
    try {
      const url = `${process.env.BASE_URL}/api/messages/markAsSeen`;
      const data = { userId, conversationId };

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        const unseenMessagesCount = responseData.unseenMessCount;
        const unseenMessageIds = responseData.unseenMessageIds;
        const seenByUsers = responseData.seenByUsers; // Array of { userId, name, avatar }

        // Emit real-time update to the room
        io.to(conversationId).emit("messagesSeen", {
          unseenMessagesCount,
          unseenMessageIds,
          seenByUsers, // Include details of users who have seen the message
        });
      } else {
        console.error("Failed to mark messages as seen:", response.statusText);
      }
    } catch (error) {
      console.error("Error in markAsSeen function:", error);
    }
  };


  function disconnectFromRoom(userRoom, userId, socket) {
    console.log("this user", userId, "has leave trigger the room")
    // Check if the room exists
    if (usersInRoom.has(userRoom)) {
      const participants = usersInRoom.get(userRoom).participants;

      // Remove the user from the participants list
      const updatedParticipants = participants.filter(
        (participantId) => participantId !== userId
      );

      if (updatedParticipants.length === 0) {
        // If no participants remain, delete the room
        usersInRoom.delete(userRoom);
        console.log(`Room ${userRoom} deleted as it is empty.`);
      } else {
        // Otherwise, update the participants list
        usersInRoom.set(userRoom, { participants: updatedParticipants });
      }

      console.log(`User ${userId} left room ${userRoom}`);
    }

    // Remove the user from the socket's room and user references
    socket.leave(userRoom);
    delete socket.userRoom;
    delete socket.userId;
  }

  function handleDisconnect(socket) {
    const userRoom = socket.userRoom;
    const userId = socket.userId;

    if (userRoom && userId) {
      disconnectFromRoom(userRoom, userId, socket);
    }


    console.log(`Socket ${socket.id} disconnected`);
  }


  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});

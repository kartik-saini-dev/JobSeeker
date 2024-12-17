
"use client";

import { useEffect, useRef, useState, useContext } from "react";
import Sidebar from "@/components/communication/chatSideBar";
import ChatHeader from "@/components/communication/chatHeader";
import MessageList from "@/components/communication/messageList";
import MessageInput from "@/components/communication/messageInput";
import SideProfile from "@/components/communication/sideProfile";
import { socket } from "@/socket";
import { GlobalContext } from "@/context/index";
import { toast } from "sonner";

import { getConversation } from "../../../services/conversations"
const MessageUser = () => {

  const [messagesData, setMessagesData] = useState([]);
  const [room, setRoom] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [conversationData, setConversationData] = useState(null);
  const fileInputRef = useRef(null);
  const messagesContainerRef = useRef(null);;
  const eventListenerAdded = useRef(false);

  const { reduceUnseenMessages, setPageLevelLoader, user, isAuthUser, conversationId } = useContext(GlobalContext);
  const userId = user?._id;

  useEffect(() => {
    setPageLevelLoader(false);
  }, [setPageLevelLoader]);

  useEffect(() => {
    const fetchAndHandleConversation = async () => {
      setIsLoading(true);


      if (!conversationId) {
        console.error("No conversation ID found in session storage.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch conversation data
        const conversation = await getConversation(conversationId);

        if (conversation?.success) {

          setConversationData(conversation.conversation);
       

          const { _id, messages } = conversation.conversation;

          // Ensure `_id` exists before proceeding
          if (_id) {

            // Set messages and room data
            setMessagesData(messages || []);
            setRoom(_id);

            // Mark messages as seen
            markMessagesAsSeen(_id);

            // Join the room for real-time updates
            socket.emit("joinRoom", { userRoom: _id, userId });

            // Handle real-time message updates
            const handleMessagesSeen = ({ unseenMessagesCount, unseenMessageIds, seenByUsers }) => {
              setMessagesData((prevMessages) =>
                prevMessages?.map((message) =>
                  unseenMessageIds?.includes(message._id)
                    ? { ...message, seenByUsers: seenByUsers }
                    : message
                )
              );
              reduceUnseenMessages(unseenMessagesCount);
            };

            socket.on("messagesSeen", handleMessagesSeen);

            // Cleanup event listener on unmount or when conversation changes
            return () => {
              socket.off("messagesSeen", handleMessagesSeen);
              socket.emit("leaveRoom", { userRoom: _id, userId });
            };
          }
        } else {
          console.error("Failed to load conversation:", conversation?.message);
        }
      } catch (error) {
        console.error("Error fetching conversation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const markMessagesAsSeen = (conversationId) => {
      try {
        socket.emit("markAsSeen", { userId, conversationId });
      } catch (error) {
        console.error("Error marking messages as seen:", error);
      }
    };

    fetchAndHandleConversation();
  }, [userId, reduceUnseenMessages, conversationId]);

  // Scroll to the bottom of the messages container when userMessages changes
  useEffect(() => {
    if (messagesContainerRef.current) {
    
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messagesData]);


  // Handle message updates and deletions
  useEffect(() => {
    socket.on('messageUpdated', ({ messageId, updatedText }) => {
      setMessagesData((prevMessages) =>
        prevMessages.map((message) =>
          message._id === messageId ? { ...message, text: updatedText } : message
        )
      );
    });
    socket.on('messageDeleted', ({ messageId }) => {
      setMessagesData((prevMessages) =>
        prevMessages.filter((message) => message._id !== messageId)
      );
    });
    return () => {
      socket.off('messageUpdated');
      socket.off('messageDeleted');
    };
  }, []);



  const handleUpdateMessage = (messageId, updatedText) => {
    const isGroup = conversationData.participants.length > 2;

    socket.emit('updateMessage', {
      messageId,
      updatedText,
      isGroup,
      groupName: conversationData.groupName,
      conversationId: conversationData._id,
      participants: conversationData.participants,
      userRoom: room,
      sender: user?._id,
    });
  };

  const handleDeleteMessage = async (messageId, type, fileUrl) => {
  
    socket.emit("deleteMessage", {
      messageId,
      userRoom: room,
      sender: userId,
      isGroup: conversationData.participants.length > 2,
      conversationId: conversationData._id,
      participants: conversationData.participants,
    });


    if (   (type === "File" || type === "Media" || type === "Document")  && fileUrl) {
      try {

        const response = await fetch("/api/cloudinary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fileURL: fileUrl }),
        });

        const data = await response.json();
        if (data.success) {
          toast.success("Image deleted successfully from Cloudinary");
        } else {
          toast.error("Failed to delete image from Cloudinary:", data.message);
        }
      } catch (error) {
        toast.error("Error deleting image from Cloudinary:", error);
      }
    }

  };


  useEffect(() => {
    const handleReceiveMessage = (data) => {
      // When a message is received, update the state with the new message
      setMessagesData((prev) => {
        if (!prev) {
          return [data]; // Add the received message
        }
        return [...prev, data]; // Append the received message
      });
    };

    if (!eventListenerAdded.current) {
      socket.on("sendmessage", handleReceiveMessage); // Listen for the sendmessage event
      eventListenerAdded.current = true;
    }

    return () => {
      socket.off("sendmessage", handleReceiveMessage); // Clean up the listener
      eventListenerAdded.current = false;
    };
  }, []);



  const sendMessage = (messageInput, setMessageInput, isSystem = false) => {
    if (conversationData && messageInput.trim()) {
      const isGroup = conversationData.participants.length > 2;
  
      const messageData = {
        message: messageInput,
        from: user?._id,
        isGroup,
        type: isSystem ? "System" : "Text", // Mark system messages
        createdAt: new Date(),
        groupName: conversationData.groupName,
        conversationId: conversationData._id,
        userRoom: room,
        participants: conversationData.participants,
      };
  
      // Emit to the server
      socket.emit("message", messageData);
  
      // Clear the message input
      setMessageInput("");
    }
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "o8kvmsp2"); // Replace with your upload preset
    formData.append("cloud_name", "dc1kpjvo6"); // Replace with your Cloudinary cloud name
  
    // Determine the Cloudinary URL based on file type
    const getUploadURL = (fileType) => {
      if (fileType.startsWith("image/")) {
        return "https://api.cloudinary.com/v1_1/dc1kpjvo6/image/upload";
      } else if (fileType.startsWith("video/")) {
        return "https://api.cloudinary.com/v1_1/dc1kpjvo6/video/upload";
      } else {
        return "https://api.cloudinary.com/v1_1/dc1kpjvo6/raw/upload"; // For documents or other files
      }
    };
  
    const uploadURL = getUploadURL(file.type);
  
    try {
      const response = await fetch(uploadURL, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      return data.secure_url; // Return the uploaded file URL
    } catch (error) {
      toast.error("Error uploading to Cloudinary:", error.message);
      throw error;
    }
  };
  const handleFileChange = async (file) => {
    if (!file) return;
  
    // Helper function to determine the file type
    const getFileType = (file) => {
      if (file.type.startsWith("image/")) {
        return "File"; // For images
      } else if (file.type.startsWith("video/")) {
        return "Media"; // For videos
      } else {
        return "Document"; // For other file types
      }
    };
  
    try {
      setIsLoading(true);
  
      // Upload file to Cloudinary
      const fileUrl = await uploadToCloudinary(file);
  
     
      if (conversationData) {
        const isGroup = conversationData.participants.length > 2;
        const fileType = getFileType(file);
  
        // Prepare message data
        const messageData = {
          message: fileUrl,
          from: user?._id,
          isGroup: isGroup,
          type: fileType, // Dynamically assign file type
          createdAt: new Date(),
          groupName: conversationData.groupName, // For group messages
          conversationId: conversationData._id,
          userRoom: room,
          participants: conversationData.participants,
        };
  
        // Emit the message via socket
        socket.emit("message", messageData);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload the file.");
    } finally {
      setIsLoading(false);
    }
  };
  


  return (
    <div className="flex flex-col md:flex-row h-[85vh] m-4 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 shadow-xl overflow-hidden">
      {isAuthUser && (
        <>
          {/* Sidebar */}
          <div className="hidden md:block w-1/4 bg-white rounded-l-lg shadow-lg p-4">
            <Sidebar />
          </div>

          {/* Chat Content */}
          <div className="flex flex-col w-full md:w-2/4 h-full bg-white rounded-lg shadow-lg">
            {conversationData ? (
              <ChatHeader conversationId={conversationData._id} groupPic={conversationData.groupPic} groupAdmin={conversationData.admin} participants={conversationData.participants} sendMessage = {sendMessage} groupName={conversationData.groupName} />
            ) : (
              <div>Loading conversation data...</div>
            )}
            <div className="flex-1 overflow-y-auto p-4 bg-cover bg-center bg-no-repeat"  style={{ backgroundImage: "url('/wallpaper.jpeg')" }} ref={messagesContainerRef}>
              <MessageList
                userMessages={messagesData || []}
                handleUpdateMessage={handleUpdateMessage}
                handleDeleteMessage={handleDeleteMessage}
              />
            </div>
            <div className="p-4 border-t">
              <MessageInput
                sendMessage={sendMessage}
                handleFileChange={handleFileChange}
                room={room}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          {conversationData ? (
            <div className="w-full md:w-1/4 bg-white p-6 rounded-r-lg shadow-lg overflow-y-auto">
              <SideProfile participants={conversationData.participants} groupPic={conversationData.groupPic} groupName={conversationData.groupName} />
            </div>
          ) : (
            <div>Loading Sidebar...</div>
          )}

        </>
      )}
    </div>
  );
};

export default MessageUser;

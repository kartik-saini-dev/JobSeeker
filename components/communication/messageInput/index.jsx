// "use client";

// import { useState, useRef, useContext } from "react";
// import { toast } from "react-toastify";
// import { FiImage, FiVideo, FiFile, FiPaperclip } from "react-icons/fi"; // React Icons
// import { socket } from "@/socket";
// import { GlobalContext } from '@/context';

// const MessageInput = ({ handleFileChange, sendMessage, room }) => {
//   const [messageInput, setMessageInput] = useState("");
//   const fileInputRef = useRef(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
//   const typingTimeoutRef = useRef(null);
//   const { user } = useContext(GlobalContext);

//   const handleSendMessage = () => {
//     if (messageInput.trim() === "") {
//       toast.warning("Message cannot be empty!");
//       return;
//     }

//     sendMessage(messageInput, setMessageInput);

//     // Emit stopTyping when the message is sent
//     socket.emit("stopTyping", { room, userId: user?._id });
//   };

//   const handleTyping = (e) => {
//     const inputValue = e.target.value;
//     setMessageInput(inputValue);

//     if (inputValue.trim() === "") {
//       socket.emit("stopTyping", { room, userId: user?._id });
//       if (typingTimeoutRef.current) {
//         clearTimeout(typingTimeoutRef.current);
//       }
//       return;
//     }

//     socket.emit("typing", { room, userId: user?._id, userName: user?.fullName });

//     if (typingTimeoutRef.current) {
//       clearTimeout(typingTimeoutRef.current);
//     }

//     typingTimeoutRef.current = setTimeout(() => {
//       socket.emit("stopTyping", { room, userId: user?._id, userName: user?.fullName });
//     }, 2000);
//   };

//   const handleAttachmentClick = (type) => {
//     fileInputRef.current.setAttribute("accept", type === "image" ? "image/*" : type === "video" ? "video/*" : "*");
//     fileInputRef.current.click();
//     setShowAttachmentOptions(false);
//   };

//   const onFileChange = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     setIsUploading(true);
//     try {
//       await handleFileChange(file);
//       toast.success(`${file.type.includes("image") ? "Image" : file.type.includes("video") ? "Video" : "File"} uploaded successfully!`);
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       toast.error("Failed to upload the file.");
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-100 rounded-lg">
//       <div className="flex items-center space-x-4">
//         <input
//           type="file"
//           onChange={onFileChange}
//           className="hidden"
//           ref={fileInputRef}
//         />
//         <div className="relative">
//           <button
//             className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
//             onClick={() => setShowAttachmentOptions((prev) => !prev)}
//           >
//             <FiPaperclip className="mr-2 text-lg" />
//             {isUploading ? "Uploading..." : "Attachment"}
//           </button>
//           {showAttachmentOptions && (
//             <div className="absolute left-0 bottom-full mb-2 bg-white border border-gray-300 rounded-lg shadow-lg">
//               <button
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
//                 onClick={() => handleAttachmentClick("image")}
//               >
//                 <FiImage className="mr-2" />
//                 Upload Image
//               </button>
//               <button
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
//                 onClick={() => handleAttachmentClick("file")}
//               >
//                 <FiFile className="mr-2" />
//                 Upload File
//               </button>
//               <button
//                 className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
//                 onClick={() => handleAttachmentClick("video")}
//               >
//                 <FiVideo className="mr-2" />
//                 Upload Video
//               </button>
//             </div>
//           )}
//         </div>
//         <input
//           type="text"
//           className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//           placeholder="Type your message..."
//           value={messageInput}
//           onChange={handleTyping}
//         />
//         <button
//           className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
//           onClick={handleSendMessage}
//         >
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default MessageInput;

"use client";

import { useState, useRef, useContext } from "react";
import { toast } from "react-toastify";
import { FiImage, FiVideo, FiFile, FiPaperclip, FiSmile } from "react-icons/fi"; // React Icons
import EmojiPicker from "emoji-picker-react";
import { socket } from "@/socket";
import { GlobalContext } from "@/context";

const MessageInput = ({ handleFileChange, sendMessage, room }) => {
  const [messageInput, setMessageInput] = useState("");
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const typingTimeoutRef = useRef(null);
  const { user } = useContext(GlobalContext);

  const handleSendMessage = () => {
    if (messageInput.trim() === "") {
      toast.warning("Message cannot be empty!");
      return;
    }

    sendMessage(messageInput, setMessageInput);

    // Emit stopTyping when the message is sent
    socket.emit("stopTyping", { room, userId: user?._id });
    setMessageInput(""); // Clear input field
  };

  const handleTyping = (e) => {
    const inputValue = e.target.value;
    setMessageInput(inputValue);

    if (inputValue.trim() === "") {
      socket.emit("stopTyping", { room, userId: user?._id });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      return;
    }

    socket.emit("typing", { room, userId: user?._id, userName: user?.fullName });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { room, userId: user?._id, userName: user?.fullName });
    }, 2000);
  };

  const handleEmojiClick = (emojiData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false); // Close emoji picker after selecting an emoji
  };

  const handleAttachmentClick = (type) => {
    fileInputRef.current.setAttribute(
      "accept",
      type === "image" ? "image/*" : type === "video" ? "video/*" : "*"
    );
    fileInputRef.current.click();
    setShowAttachmentOptions(false);
  };

  const onFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await handleFileChange(file);
      toast.success(
        `${
          file.type.includes("image")
            ? "Image"
            : file.type.includes("video")
            ? "Video"
            : "File"
        } uploaded successfully!`
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload the file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <div className="flex items-center space-x-4 relative">
        <input
          type="file"
          onChange={onFileChange}
          className="hidden"
          ref={fileInputRef}
        />
        <div className="relative">
          <button
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            onClick={() => setShowAttachmentOptions((prev) => !prev)}
          >
            <FiPaperclip className="mr-2 text-lg" />
            {isUploading ? "Uploading..." : "Attachment"}
          </button>
          {showAttachmentOptions && (
            <div className="absolute left-0 bottom-full mb-2 bg-white border border-gray-300 rounded-lg shadow-lg">
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                onClick={() => handleAttachmentClick("image")}
              >
                <FiImage className="mr-2" />
                Upload Image
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                onClick={() => handleAttachmentClick("file")}
              >
                <FiFile className="mr-2" />
                Upload File
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                onClick={() => handleAttachmentClick("video")}
              >
                <FiVideo className="mr-2" />
                Upload Video
              </button>
            </div>
          )}
        </div>
        <button
          className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-blue-500"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <FiSmile className="text-lg" />
        </button>
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          value={messageInput}
          onChange={handleTyping}
        />
        <button
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

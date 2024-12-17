// "use client";

// import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
// import { useState, useContext } from "react";
// import Image from "next/image";
// import { GlobalContext } from "@/context";

// const Message = ({
//   text,
//   userId,
//   type,
//   createdAt,
//   handleUpdate,
//   handleDelete,
//   seenBy,
//   isLastMessage, // Track the last message
//   isSystemMessage
// }) => {
//   const { user } = useContext(GlobalContext);
//   const currentUserId = user?._id;

//   const isSender = userId === currentUserId;
//   const messageContainerClass = `mb-4 ${isSender ? "text-right" : "text-left"}`;
//   const messageClass = `p-5 space-x-0 rounded-lg inline-block ${
//     isSender
//       ? "bg-blue-500 text-white"
//       : "bg-gray-300 text-black"
//   }`;

//   const [isEditing, setIsEditing] = useState(false);
//   const [editedText, setEditedText] = useState(text);
//   console.log(type,"this is type")
//   const handleEditToggle = () => setIsEditing(!isEditing);
//   const handleSaveEdit = () => {
//     handleUpdate(editedText);
//     setIsEditing(false);
//   };

//   const renderMedia = () => {
//     if (text.startsWith("https://res.cloudinary.com")) {
//       if (type === "File") {
//         return (
//           <Image
//             src={text}
//             alt="Image"
//             width={120}
//             height={120}
//             className="w-32 h-32 object-cover rounded-lg"
//           />
//         );
//       } else if (type === "Media") {
//         return (
//           <video
//             src={text}
//             controls
//             className="w-32 h-32 rounded-lg object-cover"
//           />
//         );
//       } else if (type === "Document") {
//         return (
//           <a
//             href={text}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="text-blue-500 underline"
//           >
//             View Document
//           </a>
//         );
//       }
//     }
//     return null;
//   };

//   const renderSeenBy = () => {
//     const seenByOthers = seenBy?.filter((user) => user._id !== currentUserId);

//     // Only render the "Seen By" section for the last message sent by the sender
//     if (isSender && isLastMessage && seenByOthers?.length > 0 && seenBy?.length > 0) {
//       return (
//         <div className="mt-1 text-right">
//           <span className="text-green-500 font-semibold mr-2">Seen By:</span>
//           <div className="flex items-center space-x-2 justify-end">
//             {seenByOthers.map((user) => (
//               <div key={user.userId} className="flex items-center space-x-1">
//                 {user.avatar ? (
//                   <Image
//                     src={user.avatar}
//                     alt={user.fullName}
//                     width={20}
//                     height={20}
//                     className="rounded-full"
//                     title={user.fullName}
//                   />
//                 ) : (
//                   <div className="bg-blue-500 text-white h-6 w-6 flex items-center justify-center rounded-full">
//                     {user.fullName ? user.fullName.charAt(0).toUpperCase() : ""}
//                   </div>
//                 )}
//                 <span className="text-xs text-gray-500">{user.fullName}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className={messageContainerClass}>
//       <div>
//         <div className="inline-block">
//           <span className="text-xs">
//             {isEditing ? (
//               <div className="text-right">
//                 <button
//                   className="mr-2 bg-green-500 text-white h-6 px-2"
//                   onClick={handleSaveEdit}
//                 >
//                   Save
//                 </button>
//                 <button
//                   className="bg-red-500 text-white h-6 px-2"
//                   onClick={handleEditToggle}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             ) : (
//               <>
//                 {isSender && (type === "File" || type === "Media" || type === "Document") && (
//                   <FaPencilAlt
//                     className="text-gray-500 hover:text-blue-600 mr-2 inline-block h-6 w-6 cursor-pointer"
//                     onClick={handleEditToggle}
//                   />
//                 )}
//                 {isSender && (
//                   <FaTrashAlt
//                     className="h-6 w-6 cursor-pointer text-red-500 hover:text-red-700"
//                     onClick={handleDelete}
//                   />
//                 )}
//               </>
//             )}
//           </span>
//         </div>

//         <div className={`${messageClass} ${type === "File" ? "p-0" : ""}`}>
//           {isEditing ? (
//             <input
//               className="w-full bg-transparent rounded-none outline-0"
//               type="text"
//               value={editedText}
//               onChange={(e) => setEditedText(e.target.value)}
//             />
//           ) : (
//             (type === "File" || type === "Media" || type === "Document") ? renderMedia() : <span className="block text-left">{text}</span>
//           )}
//         </div>
//       </div>

//       <div className="mt-2 text-xs text-gray-500">
//         {/* Render "Seen" below the message for sender */}
//         {renderSeenBy()}
//         <span>
//           {new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//         </span>
//       </div>
//     </div>
//   );
// };

// export default Message;

"use client";

import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
import { useState, useContext } from "react";
import Image from "next/image";
import { GlobalContext } from "@/context";

const Message = ({
  text,
  userId,
  type,
  createdAt,
  handleUpdate,
  handleDelete,
  seenBy,
  isLastMessage, // Track the last message
  isSystemMessage, // Flag to check if it's a system message
}) => {
  const { user } = useContext(GlobalContext);
  const currentUserId = user?._id;

  const isSender = userId === currentUserId;
  const messageContainerClass = isSystemMessage
    ? "flex justify-center mb-4"
    : `mb-4 ${isSender ? "text-right" : "text-left"}`;
  const messageClass = isSystemMessage
    ? "bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm italic"
    : `p-5 space-x-0 rounded-lg inline-block ${
        isSender ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
      }`;

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);

  const handleEditToggle = () => setIsEditing(!isEditing);
  const handleSaveEdit = () => {
    handleUpdate(editedText);
    setIsEditing(false);
  };

  const renderMedia = () => {
    if (text.startsWith("https://res.cloudinary.com")) {
      if (type === "File") {
        return (
          <Image
            src={text}
            alt="Image"
            width={120}
            height={120}
            className="w-32 h-32 object-cover rounded-lg"
          />
        );
      } else if (type === "Media") {
        return (
          <video
            src={text}
            controls
            className="w-32 h-32 rounded-lg object-cover"
          />
        );
      } else if (type === "Document") {
        return (
          <a
            href={text}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Document
          </a>
        );
      }
    }
    return null;
  };

  const renderSeenBy = () => {
    const seenByOthers = seenBy?.filter((user) => user._id !== currentUserId);

    if (
      isSender &&
      isLastMessage &&
      seenByOthers?.length > 0 &&
      seenBy?.length > 0
    ) {
      return (
        <div className="mt-1 text-right">
          <span className="text-green-500 font-semibold mr-2">Seen By:</span>
          <div className="flex items-center space-x-2 justify-end">
            {seenByOthers.map((user) => (
              <div key={user.userId} className="flex items-center space-x-1">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.fullName}
                    width={20}
                    height={20}
                    className="rounded-full"
                    title={user.fullName}
                  />
                ) : (
                  <div className="bg-blue-500 text-white h-6 w-6 flex items-center justify-center rounded-full">
                    {user.fullName
                      ? user.fullName.charAt(0).toUpperCase()
                      : ""}
                  </div>
                )}
                <span className="text-xs text-gray-500">{user.fullName}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={messageContainerClass}>
      <div>
        {isSystemMessage ? (
          <div className={messageClass}>{text}</div>
        ) : (
          <>
            <div className="inline-block">
              <span className="text-xs">
                {isEditing ? (
                  <div className="text-right">
                    <button
                      className="mr-2 bg-green-500 text-white h-6 px-2"
                      onClick={handleSaveEdit}
                    >
                      Save
                    </button>
                    <button
                      className="bg-red-500 text-white h-6 px-2"
                      onClick={handleEditToggle}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    {isSender &&
                      (type === "File" ||
                        type === "Media" ||
                        type === "Document") && (
                        <FaPencilAlt
                          className="text-gray-500 hover:text-blue-600 mr-2 inline-block h-6 w-6 cursor-pointer"
                          onClick={handleEditToggle}
                        />
                      )}
                    {isSender && (
                      <FaTrashAlt
                        className="h-6 w-6 cursor-pointer text-red-500 hover:text-red-700"
                        onClick={handleDelete}
                      />
                    )}
                  </>
                )}
              </span>
            </div>

            <div className={`${messageClass} ${type === "File" ? "p-0" : ""}`}>
              {isEditing ? (
                <input
                  className="w-full bg-transparent rounded-none outline-0"
                  type="text"
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                />
              ) : (type === "File" || type === "Media" || type === "Document") ? (
                renderMedia()
              ) : (
                <span className="block text-left">{text}</span>
              )}
            </div>
          </>
        )}
      </div>

      {!isSystemMessage && (
        <div className="mt-2 text-xs text-gray-500">
          {renderSeenBy()}
          <span>
            {new Date(createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}
    </div>
  );
};

export default Message;

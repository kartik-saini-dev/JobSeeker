"use client"
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Pagination from "../Home/Pagination"; // Adjust to your file structure
import { GlobalContext } from "@/context";

const Conversations = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();
  const {user}  = useContext(GlobalContext);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`/api/message/getconversation?sender=${user?._id}&page=${currentPage}`);
        setConversations(data.conversations);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [currentPage]);

  const handleConversationClick = (conversationId) => {
    router.push(`/conversation/${conversationId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="loader border-4 border-blue-300 border-t-blue-500 rounded-full h-12 w-12 animate-spin"></div>
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-center text-gray-600">No conversations found.</p>
        ) : (
          <div className="bg-white shadow-lg rounded-lg divide-y divide-gray-200">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => handleConversationClick(conv._id)}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center">
                  <div className="bg-blue-500 text-white rounded-full p-3">
                    {conv.groupName ? (
                      <span className="text-lg font-semibold">
                        {conv.groupName.charAt(0)}
                      </span>
                    ) : (
                      <i className="fas fa-user text-lg"></i>
                    )}
                  </div>
                  <div className="ml-4">
                    <h2 className="font-bold text-lg text-gray-800">
                      {conv.groupName || `Conversation: ${conv._id}`}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {conv.participants?.length || 0} Participants
                    </p>
                  </div>
                </div>
                <i className="fas fa-chevron-right text-gray-400"></i>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>
    </div>
  );
};

export default Conversations;

"use client";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa"; // Import social media icons
import { FaRegUserCircle } from "react-icons/fa";
import { useState, useEffect, useContext } from "react"; // Import necessary hooks
import { GlobalContext } from "@/context";
import {toast} from "sonner";
const RightSidebar = ({ recruiter }) => {

  const [isFollowing, setIsFollowing] = useState(false); // State to track follow status
  const { user } = useContext(GlobalContext); // Logged-in user context
  const loggedInUserId = user?._id; // Logged-in user ID from context

  useEffect(() => {
    // Check if the logged-in user is following the recruiter
    if (loggedInUserId && recruiter?.followers?.some(follower => follower.userId === loggedInUserId)) {
      setIsFollowing(true); // Set follow status based on the recruiter data
    } else {
      setIsFollowing(false); // Reset if not following
    }
  }, [loggedInUserId, recruiter?.followers]);
  
  const handleFollow = async () => {

     if(!loggedInUserId){
      toast.error("Login first");
      return;
     }
    try {
      const response = await fetch("/api/users/toggleFollow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: loggedInUserId, followerId: recruiter?._id }),
      });

      const result = await response.json();

      if (response.ok) {
        // Update the follow/unfollow state
        setIsFollowing(result.isFollowing);
      } else {
        alert(result.message || "An error occurred.");
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="w-1/4 p-4 bg-gray-100 rounded-md shadow-md h-fit">
      <h2 className="text-xl font-bold mb-4 text-center">User Information</h2>

      {/* Recruiter Avatar and Info */}
      <div className="flex items-center mb-4">
        {recruiter?.avatar ? (
          <img
            src={recruiter.avatar}
            alt={recruiter.fullName}
            className="w-16 h-16 rounded-full mr-4 shadow-md"
          />
        ) : (
          <FaRegUserCircle className="w-16 h-16 text-gray-400 mr-4" />
        )}
        <div>
          <h3 className="text-lg font-semibold">{recruiter.fullName}</h3>
          <p className="text-gray-600">{recruiter.email}</p>
        </div>
      </div>

      {/* About Section */}
      <h3 className="text-md font-semibold mb-2">About:</h3>
      <p className="text-gray-700 mb-4">
        {recruiter.about || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
      </p>

      {/* Additional Recruiter Information */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Additional Info:</h3>
        <ul className="list-disc list-inside text-gray-700">
          <li>Location: {recruiter.location || "Not specified"}</li>
          <li>Joined: {recruiter.joinedDate || "Unknown"}</li>
          <li>Posts: {recruiter.postCount || 0}</li>
          <li>Followers: {recruiter.followersCount || 0}</li>
        </ul>
      </div>

      {/* Social Links */}
      <div className="mb-4">
        <h3 className="text-md font-semibold mb-2">Connect:</h3>
        <div className="flex space-x-3">
          <a href={recruiter.facebook} target="_blank" rel="noopener noreferrer">
            <FaFacebook className="w-6 h-6 text-blue-600 hover:text-blue-800" />
          </a>
          <a href={recruiter.twitter} target="_blank" rel="noopener noreferrer">
            <FaTwitter className="w-6 h-6 text-blue-400 hover:text-blue-600" />
          </a>
          <a href={recruiter.instagram} target="_blank" rel="noopener noreferrer">
            <FaInstagram className="w-6 h-6 text-pink-600 hover:text-pink-800" />
          </a>
        </div>
      </div>

      {/* Follow Button */}
      <div className="flex justify-between mt-4">
        {recruiter?._id !== loggedInUserId && (
          <button
            onClick={handleFollow}
            className={`${isFollowing ? "bg-gray-300 text-gray-700" : "bg-custom-dark-mint-green text-white"
              } px-4 py-2 rounded-md hover:bg-gray-400`}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      {/* Additional Action Buttons */}
      <div className="flex justify-between mt-4">
        <button className="bg-custom-dark-mint-green text-white px-4 py-2 rounded-md hover:bg-blue-200">
          Message
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;

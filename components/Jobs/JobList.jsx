
"use client";
import { useContext, useState, useEffect } from "react";
import { GlobalContext } from "@/context"; // Accessing global state context
import Pagination from "@/components/Home/Pagination"; // Assuming you have a Pagination component
import { Toaster, toast } from "sonner";
import { useRouter } from "next/navigation";

const JobList = () => {
  const { filterData, user ,setPageLevelLoader} = useContext(GlobalContext); // Get filtered job data from the context
  const [page, setPage] = useState(1);
  const itemsPerPage = 2;
  const [likes, setLikes] = useState({});
  const [currentImageIndex, setCurrentImageIndex] = useState({});
  const totalPages = Math.ceil(filterData.length / itemsPerPage);
  const router = useRouter();

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Initialize likes state
  useEffect(() => {
    const initialLikes = filterData.reduce((acc, job) => {
      acc[job._id] = {
        hasLiked: job?.likes?.includes(user?._id), // Check if user has liked the job
        count: job.likes?.length || 0, // Store the likes count
      };
      return acc;
    }, {});
    setLikes(initialLikes);
  }, [filterData, user]);

  // Initialize image index for each job
  useEffect(() => {
    if (Object.keys(currentImageIndex).length === 0 && filterData.length > 0) {
      const initialImageIndex = filterData.reduce((acc, job) => {
        acc[job._id] = 0;
        return acc;
      }, {});
      setCurrentImageIndex(initialImageIndex);
    }
  }, [filterData]);

  // Like toggle functionality
  const toggleLike = async (jobId) => {

    if(!user){
      toast.error("Login first")
      return;
    }
    try {
      const response = await fetch("/api/jobs/likeToggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id, jobId }),
      });

      const result = await response.json();
      if (response.ok) {
        setLikes((prevLikes) => ({
          ...prevLikes,
          [jobId]: {
            hasLiked: result.hasLiked,
            count: prevLikes[jobId].count + (result.hasLiked ? 1 : -1), // Update likes count
          },
        }));
        toast.success(result.hasLiked ? "Liked the job!" : "Unliked the job!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred while toggling like.");
    }
  };

  // Handle next image in carousel
  const handleNextImage = (jobId, imagesLength) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [jobId]: (prev[jobId] + 1) % imagesLength,
    }));
  };

  // Handle previous image in carousel
  const handlePreviousImage = (jobId, imagesLength) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [jobId]: (prev[jobId] - 1 + imagesLength) % imagesLength,
    }));
  };

  // Navigate to job details page
  const navigateToJob = (jobId) => {
    setPageLevelLoader(true);
    router.push(`/singleJob/${jobId}`);
  };

  // Paginate the filtered jobs
  const displayedJobs = filterData.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  return (
    <div >

      <div className="space-y-8">
        {displayedJobs.length > 0 ? (
          displayedJobs.map((job) => (
            <div
              key={job._id}
              className="border rounded-lg p-6 cursor-pointer shadow-md hover:shadow-lg transition-shadow bg-white"
              onClick={() => navigateToJob(job._id)} // Navigate to single job page
            >
              <h3 className="text-2xl playfair_display font-semibold text-gray-700 mb-4">
                {job.title}
              </h3>

              {job.images.length > 0 && (
                <div className="relative">
                  <img
                    src={job.images[currentImageIndex[job._id] || 0]} // Show the current image based on index
                    alt={job.title}
                    className="w-full h-64 object-cover rounded-md mb-6"
                  />
                  {job.images.length > 1 && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreviousImage(job._id, job.images.length);
                        }}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
                      >
                        {"<"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage(job._id, job.images.length);
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-70 text-white p-2 rounded-full hover:bg-opacity-90"
                      >
                        {">"}
                      </button>
                    </>
                  )}
                </div>
              )}

              <p className="text-lg font-semibold text-gray-600 mb-4">
                Salary: ${job.salary.toLocaleString()} per year
              </p>
              <p
                className="text-gray-700 text-base mb-6"
                dangerouslySetInnerHTML={{ __html: job.description }}
              ></p>
              <p className="text-sm text-gray-500 mb-4">
                Recruiter: {job.recruiterId?.fullName}
              </p>

              {/* Like Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent navigating to the job when clicking like
                  toggleLike(job._id);
                }}
                className="mt-4 flex items-center gap-2 py-2 px-4 rounded-md bg-gray-200 hover:bg-gray-300 transition-transform transform active:scale-95"
              >
                <span
                  className={`text-xl transition-colors ${likes[job._id]?.hasLiked ? "text-red-500" : "text-gray-400"
                    }`}
                >
                  {likes[job._id]?.hasLiked ? "❤️" : "🤍"}
                </span>
                <span className="text-sm font-semibold">
                  {likes[job._id]?.hasLiked ? "Liked" : "Like"}
                </span>
                <span className="text-xs ml-2 text-gray-500">
                  ({likes[job._id]?.count || 0})
                </span>
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">No jobs available at the moment.</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      <Toaster richColors />
    </div>
  );

};

export default JobList;

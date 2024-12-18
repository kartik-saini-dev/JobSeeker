
import RightSidebar from "@/components/User/RightSidebar";
import SingleJob from "@/components/Jobs/singleJob";
import { fetchSingleJob } from '@/services/fetchJob';


const singleJobPage = async ({ params: { jobId } }) => {
  try {


    // Fetch dynamic jobs from API
    const singleUserJob = await fetchSingleJob(jobId);

    
    return (
      <div className="min-h-screen flex">

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h2 className="text-3xl playfair_display font-bold mb-4">
            Job by Recruiter
          </h2>

          {/* List of Jobs with Pagination */}
          <SingleJob job={singleUserJob.data} />
        </div>

        {/* Right Sidebar for user information */}
        <RightSidebar recruiter={ singleUserJob.data.recruiterId } />
      </div>
    );
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Error loading jobs. Please try again later.</p>
      </div>
    );
  }
};

export default singleJobPage;

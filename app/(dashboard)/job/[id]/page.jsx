
import Sidebar from "@/components/Home/Sidebar";
import RightSidebar from "@/components/User/RightSidebar";
import JobList from "@/components/Jobs/JobList";
import { fetchJobsList } from '@/services/fetchJob';



const JobsListPage = async ({ params: { id: userId } }) => {
  try {
    // Fetch dynamic jobs from API
    const userJobsList = await fetchJobsList(userId);
       
    

    return (
      <div className="min-h-screen flex">
        {/* Left Sidebar for filters */}
        <Sidebar  Jobs={userJobsList.data}/>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h2 className="text-3xl playfair_display font-bold mb-4">
            Jobs by Recruiter
          </h2>

          {/* List of Jobs with Pagination */}
          <JobList userJobs={userJobsList.data} />
        </div>

        {/* Right Sidebar for user information */}
        <RightSidebar recruiter={userJobsList.data[0]?.recruiterId} />
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

export default JobsListPage;

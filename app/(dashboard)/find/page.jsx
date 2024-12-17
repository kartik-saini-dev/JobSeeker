
// import { jobs } from '@/lib/constants';
import Sidebar from '@/components/Home/Sidebar';
import Feed from '@/components/Home/Feed';
import News from '@/components/Home/News';
import { fetchJobs } from '@/services/fetchJob';

export default async function Home() {

   
    
    try{
      const jobs = await fetchJobs();

      return (
        <div className="min-h-screen flex bg-gray-100">
          {/* Sidebar with job filters */}
          <Sidebar Jobs={jobs} />
          {/* Feed with job listings */}
          <Feed Jobs={jobs} />
          {/* News related to the job website */}
          <News />
        </div>
      );

    }catch (error) {
      console.error("Error fetching jobs:", error);
      return (
        <div className="min-h-screen flex justify-center items-center">
          <p>Error loading jobs. Please try again later.</p>
        </div>
      );
    }
  


}

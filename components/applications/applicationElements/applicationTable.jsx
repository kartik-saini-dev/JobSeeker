"use client";
import { useRouter } from "next/navigation";
import { toast,Toaster } from "sonner";
const ApplicationsTable = ({
    displayedApplications,
    selectedApplications,
    setSelectedApplications,
    handleSelectApplication,
    handleJobStatusChange,
    handleIndividualMessage,
    handleAddUserToExistingConversation
}) => {
 const router = useRouter();
 const handleClick = (userId)=>{

     if(userId){
        router.push(`/user/${userId}`)
     }else{
        toast.warning("user does not exist");
     }
 }
    return (
        <div className="overflow-x-auto">
            <Toaster />
            <table className="min-w-full table-auto bg-white shadow-md rounded-lg">
                <thead>
                    <tr className="bg-gray-100 text-left">
                        <th className="p-4">
                            <input
                                type="checkbox"
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        // Select all applications
                                        setSelectedApplications(displayedApplications.map((app) => app._id));
                                    } else {
                                        // Deselect all applications
                                        setSelectedApplications([]);
                                    }
                                }}
                                checked={selectedApplications.length === displayedApplications.length}
                            />
                        </th>
                        <th className="p-4">Job Title</th>
                        <th className="p-4">Job Category</th>
                        <th className="p-4">Company Name</th>
                        <th className="p-4">Applicant Name</th>
                        <th className="p-4">Hired</th>
                        <th className="p-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedApplications.map((application) => (
                        <tr key={application._id}>
                            <td className="p-4">
                                <input
                                    type="checkbox"
                                    checked={selectedApplications.includes(application._id)}
                                    onChange={() => handleSelectApplication(application._id)}
                                />
                            </td>
                            <td className="p-4">{application?.job?.title}</td>
                            <td className="p-4">{application?.job?.category}</td>
                            <td className="p-4">{application?.job?.companyName}</td>
                            <td className="p-4 cursor-pointer"onClick={() => handleClick(application.user?._id)}>{application.user?.fullName || "Unknown"}</td>
                            <td className="p-4">{application?.status}</td>
                            <td className="p-4">
                                <button
                                    onClick={() => handleJobStatusChange(application, "shortlisted")}
                                    className="mr-2 py-2 px-4 bg-green-500 text-white rounded-md"
                                >
                                    Shortlist
                                </button>
                                <button
                                    onClick={() => handleJobStatusChange(application, "hired")}
                                    className="py-2 px-4 bg-blue-500 text-white rounded-md"
                                >
                                    Hire
                                </button>

                                <button
                                    onClick={() => handleIndividualMessage(application)}
                                    className="ml-2 py-2 px-4 bg-gray-500 text-white rounded-md"
                                >
                                    Message
                                </button>

                                <button
                                    onClick={() => handleAddUserToExistingConversation(application._id)}
                                    className="ml-2 py-2 px-4 bg-yellow-500 text-white rounded-md"
                                >
                                    Add to Existing Conversation
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ApplicationsTable;

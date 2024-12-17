"use client";
const SortingOptions = ({ sortKey, setSortKey }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <span className="font-semibold">Sort by:</span>
      <select
        value={sortKey}
        onChange={(e) => setSortKey(e.target.value)}
        className="border p-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
      >
        <option value="title">Job Title</option>
        <option value="salary">Salary</option>
      </select>
    </div>
  );
};

export default SortingOptions;

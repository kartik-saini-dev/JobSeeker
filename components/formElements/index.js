

export const InputField = ({ label, type, name, value, onChange, placeholder, required }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold mb-2 text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
  
 export const RequirementField = ({ requirements, addRequirement, removeRequirement, handleRequirementChange }) => (
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700">Requirements</label>
      <div className="space-y-2">
        {requirements.map((requirement, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Requirement ${index + 1}`}
              value={requirement}
              onChange={(e) => handleRequirementChange(index, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => removeRequirement(index)}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRequirement}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Requirement
        </button>
      </div>
    </div>
  );
  
 export const ResponsibilityField = ({
    responsibilities,
    addResponsibility,
    removeResponsibility,
    handleResponsibilityChange,
  }) => (
    <div>
      <label className="block text-sm font-semibold mb-2 text-gray-700">Responsibilities</label>
      <div className="space-y-2">
        {responsibilities.map((responsibility, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder={`Responsibility ${index + 1}`}
              value={responsibility}
              onChange={(e) => handleResponsibilityChange(index, e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => removeResponsibility(index)}
              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addResponsibility}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Responsibility
        </button>
      </div>
    </div>
  );
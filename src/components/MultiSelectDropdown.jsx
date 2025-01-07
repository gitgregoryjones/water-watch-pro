import React, { useState, useRef } from "react";

const MultiSelectDropdown = ({ locations }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Handle option selection
  const handleOptionChange = (value) => {
    setSelectedOptions((prevSelected) => {
      if (prevSelected.includes(value)) {
        // Remove if already selected
        return prevSelected.filter((option) => option !== value);
      } else {
        // Add to selected options
        return [...prevSelected, value];
      }
    });
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full max-w-sm mx-auto" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div
        className="flex justify-between items-center border border-gray-300 bg-white rounded-md px-4 py-2 cursor-pointer"
        onClick={toggleDropdown}
      >
        <span className="text-gray-600">
          {selectedOptions.length > 0
            ? selectedOptions.join(", ")
            : "Select options"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-gray-600"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.166l3.71-3.935a.75.75 0 111.08 1.04l-4.243 4.5a.75.75 0 01-1.08 0l-4.242-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Dropdown Options */}
      {isDropdownOpen && (
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md mt-2 max-h-48 overflow-y-auto">
          {locations.map((location) => (
            <label
              key={location.id}
              className="flex items-center px-4 py-2 hover:bg-gray-100"
            >
              <input
                type="checkbox"
                value={location.name}
                checked={selectedOptions.includes(location.name)}
                onChange={() => handleOptionChange(location.name)}
                className="mr-2 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              />
              {location.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;

import React, { useState, useRef } from "react";

const MultiSelectDropdown = ({ className, locations, onSelectedOption, idField = "id" }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Handle option selection
  const handleOptionChange = (id, name) => {
    setSelectedOptions((prevSelected) => {
      if (prevSelected.includes(name)) {
        const updatedIds = selectedIds.filter((optionId) => optionId !== id);
        setSelectedIds(updatedIds);
        onSelectedOption && onSelectedOption(updatedIds);
        return prevSelected.filter((option) => option !== name);
      } else {
        const updatedIds = [...selectedIds, id];
        setSelectedIds(updatedIds);
        onSelectedOption && onSelectedOption(updatedIds);
        return [...prevSelected, name];
      }
    });
  };

  // Handle select all toggle
  const handleSelectAll = (checked) => {
    if (checked) {
      const allNames = locations.map((location) => location.name);
      const allIds = locations.map((location) => location.id);
      setSelectedOptions(allNames);
      setSelectedIds(allIds);
      onSelectedOption && onSelectedOption(allIds);
    } else {
      setSelectedOptions([]);
      setSelectedIds([]);
      onSelectedOption && onSelectedOption([]);
    }
  };

  // Filter locations based on search term
  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className={`${className} relative w-full  mx-auto`} ref={dropdownRef}>
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
        <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-md mt-2">
          {/* Close Icon */}
          <div className="flex justify-end p-2">
            <button
              className="text-gray-400 bg-gray-200 rounded-full p-1 hover:text-gray-600"
              onClick={() => setIsDropdownOpen(false)}
            >
              &times;
            </button>
          </div>
          {/* Select All Checkbox */}
          <label className="flex items-center px-4 py-2 hover:bg-gray-100">
            <input
              type="checkbox"
              className="mr-2 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
              checked={
                selectedOptions.length === locations.length && locations.length > 0
              }
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            Select All
          </label>
          {/* Search Input */}
          <div className="px-4 py-2">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Scrollable List of Options */}
          <div className="max-h-64 overflow-y-auto">
            {filteredLocations.map((location) => (
              <label
                key={location.id}
                className="flex items-center px-4 py-2 hover:bg-gray-100"
              >
                <input
                  type="checkbox"
                  value={location.name}
                  checked={selectedOptions.includes(location.name)}
                  onChange={() => handleOptionChange(location[idField], location.name)}
                  className="mr-2 h-4 w-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                />
                {location.name}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Hidden Field for Selected IDs */}
      <input type="hidden" name="selectedLocationIds" value={selectedIds.join(",")} />
    </div>
  );
};

export default MultiSelectDropdown;

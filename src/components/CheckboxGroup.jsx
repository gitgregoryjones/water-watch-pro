import React, { useState } from 'react';

const CheckboxGroup = ({ onClick, color }) => {
  const [selectedValue, setSelectedValue] = useState(color);

  const handleClick = (value) => {
    setSelectedValue(value);
    if (onClick) {
      onClick(value); // Call the optional onClick prop with the selected value
    }
  };

  return (
    <div className="flex flex-col p-2 ">
      {/* Normal */}
      <label className="flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          value="green"
          checked={selectedValue === 'green'}
          onChange={() => handleClick('green')}
          className="cursor-pointer"
        />
        <span>All</span>
      </label>

      {/* Above Threshold */}
      <label className="flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          value="orange"
          checked={selectedValue === 'orange'}
          onChange={() => handleClick('orange')}
          className="cursor-pointer"
        />
        <span>Above Threshold</span>
      </label>

      {/* Above NOAA 14 */}
      <label className="flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          value="red"
          checked={selectedValue === 'red'}
          onChange={() => handleClick('red')}
          className="cursor-pointer"
        />
        <span>Above NOAA 14</span>
      </label>
    </div>
  );
};

export default CheckboxGroup;

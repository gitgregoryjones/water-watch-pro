import React, { useState } from 'react';

const CheckboxGroup = ({ onClick, color, className }) => {
  const [selectedValue, setSelectedValue] = useState(color);

  const handleClick = (value) => {
    setSelectedValue(value);
    if (onClick) {
      onClick(value); // Call the optional onClick prop with the selected value
    }
  };

  return (
    <div className={`flex sm:flex-row p-2 ${className}`}>
      {/* Normal */}
      <label className={`flex items-center space-x-2 text-sm `}>
        <input
          type="checkbox"
          value="green"
          checked={selectedValue === 'green'}
          onChange={() => handleClick('green')}
          className="cursor-pointer accent-[green] text-[white] "
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
          className="cursor-pointer accent-orange-600 text-[white] "
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
          className="text-[white] cursor-pointer  accent-[red]"
        />
        <span>Above NOAA 14</span>
      </label>
    </div>
  );
};

export default CheckboxGroup;

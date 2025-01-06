import React, { useState } from 'react';
import Upgrade from './Upgrade';

const CheckboxGroup = ({ onClick, color, className }) => {
  const [selectedValue, setSelectedValue] = useState(color);

  const handleClick = (value) => {
    setSelectedValue(value == selectedValue ? "green" : value);
    if (onClick) {
      onClick(value == selectedValue ? "green" : value); // Call the optional onClick prop with the selected value
    }
  };

  return (
    
    <div>
      <div  className='md:hidden flex justify-center items-center my-2 '>Sort Location By:</div>
    <div className={`flex items-center justify-center sm:flex-row p-2 ${className}`}>
      <label className='hidden md:flex w-full  items-center justify-center rounded text-[white] bg-[green] text-sm p-1'>Sort Location By:</label>
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
      <label className=" flex items-center space-x-2 text-sm">
        <input
          type="checkbox"
          value="zero"
          checked={selectedValue === 'zero'}
          onChange={() => handleClick('zero')}
          className="cursor-pointer accent-orange-600 text-[white] "
        />
        <span>Hide Zeroes</span>
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
      <Upgrade showMsg={false} tier={2}>
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
      </Upgrade>
      
    </div>
    </div>
   
  );
};

export default CheckboxGroup;

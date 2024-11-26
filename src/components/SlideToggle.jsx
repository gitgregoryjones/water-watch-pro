import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SlideToggle = ({ isHTML = false, onToggle }) => {
  const [isHtmlActive, setIsHtmlActive] = useState(isHTML);

  const handleToggle = () => {
    const newValue = !isHtmlActive;
    setIsHtmlActive(newValue);
    //onToggle(newValue); // Notify parent of the new state
  };

  return (
    <div
      className={`relative w-28 h-8 rounded-full flex items-center cursor-pointer ${
        isHtmlActive ? 'bg-green-500' : 'bg-blue-500'
      }`}
      onClick={handleToggle}
    >
      <div
        className={`absolute left-1 top-1 h-6 w-14 bg-white rounded-full transition-transform ${
          isHtmlActive ? 'transform translate-x-0' : 'transform translate-x-12'
        }`}
      ></div>
      <div className="absolute left-4 text-black text-xs font-bold">
        {isHtmlActive ? 'HTML' : ''}
      </div>
      <div className="absolute right-4 text-black text-xs font-bold">
        {isHtmlActive ? '' : 'CSV'}
      </div>
    </div>
  );
};

SlideToggle.propTypes = {
  isHTML: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
};

export default SlideToggle;

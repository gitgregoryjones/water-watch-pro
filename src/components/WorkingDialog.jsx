import React, { useEffect, useState } from 'react';

const WorkingDialog = ({ showDialog,  }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (showDialog) {
      setIsVisible(true); // Show the dialog immediately
      // Ensure the dialog remains visible for at least 2 seconds
      timeoutId = setTimeout(() => {
        if (!showDialog) {
          setIsVisible(false);
         
        }
      }, 2000);
    } else {
      // Allow dialog to close after 2 seconds minimum
      timeoutId = setTimeout(() => {
        setIsVisible(false);
      
      }, 800);
    }

    return () => clearTimeout(timeoutId); // Cleanup timeout on unmount or prop change
  }, [showDialog]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg text-center">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          {/* Text */}
          <p className="text-lg font-semibold text-gray-800">Working...</p>
        </div>
      </div>
    </div>
  );
};

export default WorkingDialog;

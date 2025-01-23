import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const NotificationBanner = ({ message, bgColor = 'bg-blue-500', textColor = 'text-white' }) => {
  const user = useSelector((state) => state.userInfo.user);
  const [isVisible, setIsVisible] = useState(true);

  // Save dismissal state in localStorage to persist between sessions
  useEffect(() => {
    const dismissed = localStorage.getItem(`notificationDismissed_${user.email}`);
    if (dismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`notificationDismissed_${user.email}`, 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleDismiss} className={`fixed top-0 left-0 w-full  ${bgColor} ${textColor} flex justify-center   items-start py-3 px-8 shadow-md z-50`}
    >
      {message}
      <button
        className="hidden md:flex ml-4 focus:outline-none"
        onClick={handleDismiss}
        aria-label="Dismiss Notification"
      >
        <i className="fas fa-times  text-slate-800 text-lg"></i>
      </button>
    </div>
  );
};

export default NotificationBanner;

import React from 'react';
import { Link } from 'react-router-dom';

const RegistrationComplete = () => {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-white to-[#99BA93] flex flex-col items-center justify-center text-center">
      <div className="bg-white shadow-md rounded-xl p-8 md:w-[50%] w-[90%]">
        <img
          src="http://localhost:5173/src/assets/logo.png"
          alt="Site Logo"
          className="w-32 mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-green-800 mb-4">Thank You for Registering!</h1>
        <p className="text-lg text-gray-700 mb-6">
          We've sent a verification link to your email. Please check your inbox (and spam folder, just in case) to complete the login process.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors duration-200"
          >
            Go to Login
          </Link>
        </div>
        <div className="mt-4">
          <p className="text-gray-600 text-sm">
            Didn’t receive the email?{" "}
            <Link
              to="/resend-verification"
              className="text-green-700 font-bold hover:underline"
            >
              Resend Verification Email
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationComplete;

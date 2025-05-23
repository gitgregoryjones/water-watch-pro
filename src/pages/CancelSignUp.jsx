import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utility/api"; // Axios instance
import Stripe from "stripe"; // Ensure you have the Stripe Node.js library installed
import {
  VITE_EMAIL_PROXY,VITE_WATER_WATCH_SUPPORT,
} from "../utility/constants";
import { abandon } from "../utility/abandon";

const stripe = new Stripe(import.meta.env.VITE_PAYMENT_LINK_GOLD);



const CancelSignUp = () => {
  const [searchParams] = useSearchParams();
  const session_id = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    const handleCancelSignup = async () => {
      try {
        if (!session_id) {
          console.error("Session ID is missing from the request params.");
          return;
        }

        // Step 1: Retrieve session details from Stripe
        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (!session.customer) {
          console.error("No customer associated with this session.");
          return;
        }

        // Step 2: Retrieve customer details from Stripe
        const customer = await stripe.customers.retrieve(session.customer);


        const emailResponse  =  abandon(customer,session_id)

       
        setTimeout(()=> navigate("/"),5000)


        console.log("Email sent successfully:", emailResponse.data);
      } catch (error) {
        navigate("/")
        console.error("Error handling cancel signup:", error.message);
      }
    };

    handleCancelSignup();
  }, [session_id]);

  return (
    <div>
      <h1>Cancel Signup</h1>
      <p>It appears you experienced an issue with sign-up.  Someone from our support@waterwatchpro.com team will be in touch soon to assist you.</p>
    </div>
  );
};

export default CancelSignUp;

import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utility/api"; // Axios instance
import Stripe from "stripe"; // Ensure you have the Stripe Node.js library installed
import {
  VITE_SOCKETLABS_API_KEY,
  VITE_SOCKETLABS_FROM_EMAIL,
  VITE_SOCKETLABS_SERVER_ID,
} from "../utility/constants";

const stripe = new Stripe(import.meta.env.VITE_PAYMENT_LINK_GOLD);

const CancelSignUp = () => {
  const [searchParams] = useSearchParams();
  const session_id = searchParams.get("session_id");

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

        // Step 3: Prepare email content
        const emailContent = {
         
              toEmail: "gregory.jones05@gmail.com",
              
              subject: "Abandoned Signup Notification",
              textBody: `A user has abandoned the signup process:
Customer Email: ${customer.email}
Customer Phone: ${customer.phone || "Not provided"}
Metadata: ${JSON.stringify(customer.metadata || {})}
Session ID: ${session_id}`,
              htmlBody: `<html>
                <body>
                  <h1>Abandoned Signup Notification</h1>
                  <p>A user has abandoned the signup process:</p>
                  <ul>
                    <li><strong>Customer Email:</strong> ${customer.email}</li>
                    <li><strong>Customer Phone:</strong> ${customer.phone || "Not provided"}</li>
                    <li><strong>Metadata:</strong> ${JSON.stringify(customer.metadata || {})}</li>
                    <li><strong>Session ID:</strong> ${session_id}</li>
                  </ul>
                </body>
              </html>`,
            }

      
        const emailResponse = await api.post(
          "https://dev-water-watch-pro.netlify.app/.netlify/functions/sendEmail",
          emailContent,
          {
            headers: {
                "Content-Type": "application/json"
            },
          }
        );

        console.log("Email sent successfully:", emailResponse.data);
      } catch (error) {
        console.error("Error handling cancel signup:", error.message);
      }
    };

    handleCancelSignup();
  }, [session_id]);

  return (
    <div>
      <h1>Cancel Signup</h1>
      <p>If the session was abandoned, an email has been sent to support.</p>
    </div>
  );
};

export default CancelSignUp;

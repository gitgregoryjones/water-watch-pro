import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../utility/api"; // Axios instance
import Stripe from "stripe"; // Ensure you have the Stripe Node.js library installed
import {
  VITE_EMAIL_PROXY,VITE_WATER_WATCH_SUPPORT,
} from "../utility/constants";

const stripe = new Stripe(import.meta.env.VITE_PAYMENT_LINK_GOLD);

function getItems(obj, plain){

    let details = plain == true ? "Customer Details\n" :  "<ul>>Customer Details";
    Object.keys(obj).forEach((key) => {
        if(plain == true){
            details += `${key} = ${obj[key]}\n`;
        }else {
            details += `<li>${key} = ${obj[key]}</li>`; 
        }
    });
    details += plain == true ? "" : "</ul>"
return details;
}

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

        // Step 3: Prepare email content
        const emailContent = {
         
              toEmail: VITE_WATER_WATCH_SUPPORT,
              
              subject: "Abandoned Signup Notification",
              textBody: `A user has abandoned the signup process:
Customer Email: ${customer.email}
Customer Phone: ${customer.phone || "Not provided"}
Metadata: ${getItems(customer.metadata,true)}
Session ID: ${session_id}`,
              htmlBody: `<html>
                <body>
                  <h1>Abandoned Signup Notification</h1>
                  <p>A user has abandoned the signup process:</p>
                  <ul>
                    <li><strong>Customer Email:</strong> ${customer.email}</li>
                    <li><strong>Customer Phone:</strong> ${customer.phone || "Not provided"}</li>
                    <li><strong>Metadata:</strong> ${getItems(customer.metadata) || ""}</li>
                    <li><strong>Session ID:</strong> ${session_id}</li>
                  </ul>
                </body>
              </html>`,
            }

      
        const emailResponse = await api.post(
            VITE_EMAIL_PROXY,
          emailContent,
          {
            headers: {
                "Content-Type": "application/json"
            },
          }
        );

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

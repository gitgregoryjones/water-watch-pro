// Import necessary modules
const axios = require("axios");
require("dotenv").config(); // Load environment variables for local development

// Retrieve environment variables
const SOCKETLABS_API_KEY = process.env.VITE_SOCKETLABS_API_KEY;
const SOCKETLABS_FROM_EMAIL = process.env.VITE_SOCKETLABS_FROM_EMAIL;
const SOCKETLABS_SERVER_ID = process.env.VITE_SOCKETLABS_SERVER_ID;

// The main handler function
exports.handler = async (event) => {
  try {
    // Parse the incoming request body
    const { toEmail, subject, textBody, htmlBody } = JSON.parse(event.body);

    // Validate required fields
    if (!toEmail || !subject || !textBody || !htmlBody) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields: toEmail, subject, textBody, htmlBody" }),
      };
    }

    // Prepare the SocketLabs email payload
    const payload = {
      ServerId: SOCKETLABS_SERVER_ID,
      ApiKey: SOCKETLABS_API_KEY,
      Messages: [
        {
          To: [{ emailAddress: toEmail }],
          From: {
            emailAddress: SOCKETLABS_FROM_EMAIL,
            friendlyName: "Waterwatch Pro",
          },
          Subject: subject,
          TextBody: textBody,
          HtmlBody: htmlBody,
        },
      ],
    };

    console.log(`Payload is ${JSON.stringify(payload)}`)
    // Send the email using the SocketLabs API
    const response = await axios.post("https://inject.socketlabs.com/api/v1/email", payload, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SOCKETLABS_API_KEY}`
      },
    });

    // Return a successful response
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Email sent successfully",
        data: response.data,
      }),
    };
  } catch (error) {
    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to send email",
        details: error.message,
      }),
    };
  }
};

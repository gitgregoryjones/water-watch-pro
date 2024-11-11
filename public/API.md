

# API Documentation: Water Watch Pro

This document outlines the API structure for the **Water Watch Pro** application, focusing on endpoints for user authentication, rainfall data, location management, and user-specific settings. The backend is designed to securely serve data to the frontend React application.

## Authentication & User Management

### POST `/api/auth/login`
- **Description**: Authenticates a user and returns a JWT token for authorization.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }

Response:

{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com"
  }
}

POST /api/auth/register

Description: Registers a new user.

Request Body:

{
  "name": "John Doe",
  "email": "user@example.com",
  "mobile": "314-444-1212",
  "password": "password123",
  "tier": 0
}

Response:

{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "mobile":"314-444-1212",
    "tier":0
  }
}



Here’s an updated version of the user profile structure to include a mobile phone number for SMS alerts. This will be incorporated in the API endpoints for user management and settings to ensure the mobile number is accessible and editable for users who want to receive SMS notifications.

Updated User Profile Structure

Each user now has the following attributes:

id: Unique identifier for the user.

name: Full name of the user.

email: Email address for authentication and communication.

mobile: Mobile phone number for SMS alerts.

tier: Subscription level for the user (0-4). Trial, Bronze, Silver, Gold, Future

role: User role (Admin, Client, User).

Example User Profile

{
  "id": 42,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "mobile": "+1234567890",
  "tier": 3,
  "role": "Admin"
}

Updated API Endpoints for User Profile & Settings

1. GET /api/users/{userId}

Description: Retrieves the profile information for a specified user, including the mobile phone number for SMS alerts.

Path Parameters:

userId: The ID of the user.

Response:

{
  "id": 42,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "mobile": "+1234567890",
  "tier": 3,
  "role": "Admin"
}

2. PUT /api/users/{userId}

Description: Updates the profile information for the authenticated user, including the mobile phone number for SMS alerts.  I assume backend only allows subscription upgrades/downgrades after getting a success from Stripe for payment processing 

Path Parameters:

userId: The ID of the user (usually extracted from the JWT token to ensure the user is updating their own information).

Request Body:

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "mobile": "+1234567890",
  "tier": 3, //TIER NOT ALLOWED UNLESS ADMIN ROLE!!!
  "role": "Admin"
}

Response:

{
  "message": "User profile updated successfully",
  "user": {
    "id": 42,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "mobile": "+1234567890",
    "tier": 3,
    "role": "Admin"
  }
}



To manage subscription upgrades or downgrades with Stripe, you can create a dedicated route that handles the user's subscription tier updates. This route will interact with the Stripe API to create or update a subscription, and it will update the user's tier in your database based on the subscription level.

Here's how the subscription management API could be structured:

New Subscription Management Endpoints

1. POST /api/subscriptions/upgrade

Description: Upgrades the user's subscription to a higher tier. This endpoint interacts with the Stripe API to create or update the subscription, and then updates the user's tier level in the application.

Request Body:

{
  "userId": 42,
  "tier": 3,           // Desired tier level (1-4)
  "paymentMethodId": "pm_1Iv1KJ2eZvKYlo2CeK9FhtUg"  // Stripe Payment Method ID
}

Backend Logic:

Step 1: Verify that the userId and tier are valid.

Step 2: Create or update the subscription in Stripe using the paymentMethodId and update the plan according to the specified tier.

Step 3: Update the user’s tier in the database upon successful subscription update in Stripe.

Response:

{
  "message": "Subscription upgraded successfully",
  "user": {
    "id": 42,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "tier": 3,
    "role": "Client"
  }
}

Notes:

This endpoint assumes the user has provided a valid payment method ID.

Stripe subscription IDs and other details should be stored in your database to track the subscription status.

2. POST /api/subscriptions/downgrade

Description: Downgrades the user's subscription to a lower tier. This endpoint will interact with Stripe to update the user's subscription plan, and it will update the user's tier level in the application.

Request Body:

{
  "userId": 42,
  "tier": 1  // Desired tier level for downgrade
}

Backend Logic:

Step 1: Verify that the userId and requested tier are valid and that the requested tier is lower than the current tier.

Step 2: Update the Stripe subscription to the new plan corresponding to the lower tier.

Step 3: Update the user's tier level in the database to reflect the downgrade.

Response:

{
  "message": "Subscription downgraded successfully",
  "user": {
    "id": 42,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "tier": 1,
    "role": "Client"
  }
}

Backend Implementation Tips for Stripe Integration

Stripe Subscription Plans:

Define subscription plans in Stripe that correspond to each tier level. For example:

Tier 1: Basic Plan

Tier 2: Standard Plan

Tier 3: Premium Plan

Tier 4: Enterprise Plan

Subscription Creation and Updates:

Use the Stripe SDK in your backend to create or update subscriptions. Here’s a quick example:

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function updateSubscription(userId, tier, paymentMethodId) {
  // Fetch user and current subscription details from your database
  const user = await getUserById(userId);

  // Check if user already has a Stripe subscription ID
  if (user.stripeSubscriptionId) {
    // Update existing subscription to the new tier
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      items: [{ plan: getPlanIdForTier(tier) }],
    });
  } else {
    // Create a new subscription if none exists
    const subscription = await stripe.subscriptions.create({
      customer: user.stripeCustomerId,
      items: [{ plan: getPlanIdForTier(tier) }],
      default_payment_method: paymentMethodId,
    });
    // Store the new subscription ID in your database
    await saveSubscriptionId(userId, subscription.id);
  }

  // Update the user's tier level in your database
  await updateUserTier(userId, tier);
}

Helper Function getPlanIdForTier:

Create a helper function to map tier levels to Stripe plan IDs.

function getPlanIdForTier(tier) {
  const planMap = {
    1: 'plan_tier1',
    2: 'plan_tier2',
    3: 'plan_tier3',
    4: 'plan_tier4',
  };
  return planMap[tier];
}

Error Handling:

Ensure the backend handles cases such as invalid userId, tier, or paymentMethodId.

Include robust error handling for Stripe API errors, like insufficient funds or invalid payment methods.

Summary of New Subscription Endpoints

Endpoint

Method

Description

/api/subscriptions/upgrade     

POST   

Upgrades the user's subscription and tier level   

/api/subscriptions/downgrade   

POST   

Downgrades the user's subscription and tier level 

By using these endpoints, the backend will interact with Stripe to manage user subscription plans and reflect those changes in the user’s profile within the application, ensuring consistency across billing and app access levels. This setup also allows for secure and streamlined handling of subscription upgrades and downgrades.

Updated Settings for SMS Notifications

We can also update the user’s settings to include preferences for SMS notifications.

3. GET /api/settings

Description: Retrieves user-specific settings, including whether SMS notifications are enabled.

Response:

{
  "units": "imperial",
  "notifications": {
    "email": true,
    "sms": true  // Whether SMS notifications are enabled
  },
  "alertThreshold": {
    "dailyRainfall": 5.0,
    "hourlyRainfall": 1.5
  }
}

4. PUT /api/settings

Description: Updates the user’s settings, including enabling or disabling SMS notifications.

Request Body:

{
  "units": "metric",
  "notifications": {
    "email": true,
    "sms": false  // Enable or disable SMS notifications
  },
  "alertThreshold": {
    "dailyRainfall": 3.0,
    "hourlyRainfall": 1.0
  }
}

Response:

{
  "message": "Settings updated successfully",
  "settings": {
    "units": "metric",
    "notifications": {
      "email": true,
      "sms": false
    },
    "alertThreshold": {
      "dailyRainfall": 3.0,
      "hourlyRainfall": 1.0
    }
  }
}

Database Schema Considerations

users table:

Add a mobile column to store the user’s mobile phone number.

Ensure the mobile field is formatted correctly, ideally stored in E.164 format (e.g., +1234567890).

Settings Management:

Update the settings schema to include a notifications object with email and sms boolean fields.

Validation:

Validate the mobile field for correct phone number format.

Validate that the sms setting is only enabled if the user has provided a valid mobile number.

Example Database Schema for users Table

Column

Type

Description

id         

INT      

Primary key                       

name       

VARCHAR  

Full name of the user             

email      

VARCHAR  

Email address                     

mobile     

VARCHAR  

Mobile phone number for SMS alerts

tier       

INT      

Tier level (0-4)                  

role       

ENUM     

Role of the user (Admin, Client, User) 

By including the mobile attribute and settings for SMS notifications, this API design allows for flexible, user-specific alert configurations that will help enhance user engagement and ensure timely weather updates.

Rainfall Data & Forecasting

GET /api/rainfall/history

Description: Retrieves historical rainfall data for a specific latitude and longitude.

Query Parameters:

lat: Latitude of the location.

lng: Longitude of the location.

startDate: Start date (YYYY-MM-DD).

endDate: End date (YYYY-MM-DD).

Response:

{
  "location": {
    "lat": 33.7490,
    "lng": -84.3880,
    "name": "Atlanta, GA"
  },
  "data": [
    {
      "date": "2023-11-01",
      "rainfallAmount": 3.2
    },
    {
      "date": "2023-11-02",
      "rainfallAmount": 1.8
    }
  ]
}

GET /api/rainfall/forecast

Description: Provides a rainfall forecast for the next specified number of days.

Query Parameters:

lat: Latitude of the location.

lng: Longitude of the location.

days: Number of days for the forecast (1-7).

Response:

{
  "location": {
    "lat": 33.7490,
    "lng": -84.3880,
    "name": "Atlanta, GA"
  },
  "forecast": [
    {
      "date": "2023-11-07",
      "rainfallAmount": 4.1
    },
    {
      "date": "2023-11-08",
      "rainfallAmount": 2.3
    }
  ]
}

Location Management (User-Specific)

Each location endpoint will be filtered by the authenticated user's ID, which is extracted from the JWT token.

GET /api/locations

Description: Retrieves a list of locations for the authenticated user.

Response:

[
  {
    "id": 1,
    "name": "Atlanta, GA",
    "lat": 33.7490,
    "lng": -84.3880,
    "userId": 42
  },
  {
    "id": 2,
    "name": "New York, NY",
    "lat": 40.7128,
    "lng": -74.0060,
    "userId": 42
  }
]

POST /api/locations

Description: Adds a new location for the authenticated user.

Request Body:

{
  "name": "Los Angeles, CA",
  "lat": 34.0522,
  "lng": -118.2437
}

Response:

{
  "message": "Location added successfully",
  "location": {
    "id": 3,
    "name": "Los Angeles, CA",
    "lat": 34.0522,
    "lng": -118.2437,
    "userId": 42
  }
}

DELETE /api/locations/{id}

Description: Deletes a location associated with the authenticated user.

Response:

{
  "message": "Location deleted successfully"
}

User Settings & Preferences

GET /api/settings

Description: Retrieves user-specific settings and preferences.

Response:

{
  "units": "imperial",
  "notifications": true,
  "alertThreshold": {
    "dailyRainfall": 5.0,
    "hourlyRainfall": 1.5
  }
}

PUT /api/settings

Description: Updates the user’s settings and preferences.

Request Body:

{
  "units": "metric",
  "notifications": false,
  "alertThreshold": {
    "dailyRainfall": 3.0,
    "hourlyRainfall": 1.0
  }
}

Response:

{
  "message": "Settings updated successfully",
  "settings": {
    "units": "metric",
    "notifications": false,
    "alertThreshold": {
      "dailyRainfall": 3.0,
      "hourlyRainfall": 1.0
    }
  }
}

Authorization & Security

JWT Authentication: Each request that modifies or retrieves user-specific data must include a valid JWT token in the Authorization header.

Error Handling: Each endpoint should provide helpful error messages and proper status codes.

Middleware for Token Authentication

To ensure that requests are securely authenticated, add middleware to decode the JWT token and attach the user ID to each request.

const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.id;
    next();
  });
}

Summary of API Endpoints

Endpoint

Method

Description

/api/auth/login                      

POST   

Authenticates a user and returns a JWT                       

/api/auth/register                   

POST   

Registers a new user                                         

/api/rainfall/history                

GET    

Retrieves historical rainfall data                           

/api/rainfall/forecast               

GET    

Provides rainfall forecast data                              

/api/locations                       

GET    

Retrieves the list of monitored locations (user-specific)    

/api/locations                       

POST   

Adds a new location to the monitored list                    

/api/locations/{id}                  

DELETE 

Deletes a location from the monitored list                   

/api/settings                        

GET    

Retrieves user-specific settings and preferences             

/api/settings                        

PUT    

Updates user-specific settings and preferences               

Incorporating a list of users who manage each location introduces an additional layer of access control and customization. Here’s how we can adjust the location-related endpoints and add user management endpoints to support location-specific settings, including a list of users who can manage each location.

Updated Location Management Endpoints

1. GET /api/locations

Description: Retrieves a list of locations managed by the authenticated user.

Response:

[
  {
    "id": 1,
    "name": "Atlanta, GA",
    "lat": 33.7490,
    "lng": -84.3880,
    "managers": [
      { "userId": 42, "name": "John Doe", "email": "john.doe@example.com" },
      { "userId": 43, "name": "Jane Smith", "email": "jane.smith@example.com" }
    ]
  },
  {
    "id": 2,
    "name": "New York, NY",
    "lat": 40.7128,
    "lng": -74.0060,
    "managers": [
      { "userId": 42, "name": "John Doe", "email": "john.doe@example.com" }
    ]
  }
]

Notes:

managers is an array containing users who have access to manage this location.

Each manager has a userId, name, and email.

2. POST /api/locations

Description: Adds a new location with an initial list of managers (including the authenticated user).

Request Body:

{
  "name": "Los Angeles, CA",
  "lat": 34.0522,
  "lng": -118.2437,
  "managers": [
    { "userId": 42 },
    { "userId": 44 }
  ]
}

Response:

{
  "message": "Location added successfully",
  "location": {
    "id": 3,
    "name": "Los Angeles, CA",
    "lat": 34.0522,
    "lng": -118.2437,
    "managers": [
      { "userId": 42, "name": "John Doe", "email": "john.doe@example.com", mobile:"444-234-1234" },
      { "userId": 44, "name": "Emily Davis", "email": "emily.davis@example.com",mobile:"234-344-2004" }
    ]
  }
}

3. PATCH /api/locations/{id}/managers

Description: Updates the list of managers for a specific location.

Path Parameters:

id: The ID of the location.

Request Body:

{
  "addManagers": [
    { "userId": 45 },
    { "userId": 46 }
  ],
  "removeManagers": [
    { "userId": 43 }
  ]
}

Response:

{
  "message": "Managers updated successfully",
  "location": {
    "id": 1,
    "name": "Atlanta, GA",
    "lat": 33.7490,
    "lng": -84.3880,
    "managers": [
      { "userId": 42, "name": "John Doe", "email": "john.doe@example.com", "mobile":"444-333-1212" },
      { "userId": 45, "name": "Alice Green", "email": "alice.green@example.com","mobile":"901-345-1234" },
      { "userId": 46, "name": "Bob Brown", "email": "bob.brown@example.com","mobile":"888-123-1234" }
    ]
  }
}

Notes:

addManagers: A list of user IDs to add as managers.

removeManagers: A list of user IDs to remove from the list of managers.

Only users with existing management access should be able to modify the managers list.

User Management Endpoints for Locations

These endpoints allow for the management of users specifically associated with each location.

GET /api/locations/{locationId}/managers

Description: Retrieves the list of users managing a specific location.

Path Parameters:

locationId: The ID of the location.

Response:

{
  "locationId": 1,
  "locationName": "Atlanta, GA",
  "managers": [
    { "userId": 42, "name": "John Doe", "email": "john.doe@example.com" },
    { "userId": 43, "name": "Jane Smith", "email": "jane.smith@example.com" }
  ]
}

Summary of Updated and New Endpoints

Endpoint

Method

Description

/api/locations                            

GET    

Retrieves list of locations managed by the user        

/api/locations                            

POST   

Adds a new location with a list of initial managers    

/api/locations/{id}/managers              

PATCH  

Updates managers for a specific location               

/api/locations/{locationId}/managers      

GET    

Retrieves managers for a specific location             

Additional Implementation Notes

Database Schema:

locations table: Add a managers field or a location_managers junction table that associates locationId with userId.

Authorization:

Ensure that only users listed as managers can retrieve, add, or remove managers.

Error Handling:

Validate that users being added as managers exist in the user database.

Return an appropriate error if a user without management permissions attempts to modify the list.

This setup provides secure and flexible access control for each location by enabling multiple users to manage shared locations, while limiting access based on user roles and permissions.
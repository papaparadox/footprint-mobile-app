# Footprint API Documentation

Base URL: https://footprint-mobile-app.onrender.com/ 

We built an API that provides a comprehensive backend for a travel tracking and social sharing application. It allows users to manage their identity, document their global travels, organise specific trips with media and visualise their travel statistics. 

## Authentification 

The API uses JWT (Json Web Token) for secure access. Most endpoints require an Authorisation header. 

- Header Format: Authorization: Bearer <jwt_token> 
- Encryption: Passwords are one way hashed using bcrypt

### Authentication Endpoints: 

**Public routes for registration and login**

- POST/register: New users can create accounts
- POST/login: Users log in to receive a JWT token to start session 

**Protected route for profile**

- GET/profile: view user’s profile
- PATCH/profile/update: update user’s profile details 
- DELETE/profile/delete: provides a way to remove user record from system


## Countries & Geography

**Access a global database of locations to log (populate) user profiles and trips selectors.**

- GET/country: List all 195 countries of the globe
- GET/country/:id: Get specific country details
- GET/country:id/cities: Retrieve major cities within a specific country

## Visited Locations

**Manage a user’s world map stats**

- GET/visited/:userId:  View all countries a specific user has visited
- POST/visited : Log a single country visit
- POST/visited/bulk - Onboarding Tool: Log multiple countries at once (e.g. {countryIds: [1, 5, 22]} ).
- DELETE/visited/:id: Remove a country from the user’s visited list

## Trips & Social Sharing

**Organise specific journeys with dates, notes and public sharing capabilities.** 

- GET/trip/user/:userId: Retrieve all trips belonging to a user.
- GET/trip/:id: Get full trip details, including visited cities and media.
- POST/trip/ : Create a new trip entry. 
- PATCH/trip/:id: Edit trip details (title, dates or description).
- DELETE/trip/:id: Delete a trip and its associated data.
- GET/trip/share/:token - Public Access: View a trip via unique share token

## Trip Media

**Integrated media management via Cloudinary.**

- GET/trip/:id/images: List all images associated with a trip
- POST/trip/:id/images: Upload an image file. Return the  to Cloudinary URL and save it to the database. 
- DELETE/trip/:id/images/:imageID: Remove an image from the trip and the cloud storage.

## Analytics

- GET/stats/:userID: Generate travel data. 

Returns: Total countries visited, percentage of the world explored, continent breakdown and recent milestones.

## Friend Section

**Connect with other travelers, compare statistics and manage network**

- POST/friends/request : Send friend request to another user
- GET/ friends/search: Search for users
- GET/friends/requests : View all the pending incoming friend requests
- GET/friends: List all confirmed friends
- GET/friends/:id/profile: View a fiend's public profile and travel map
- GET/friends/:id/compare: Compare travel stats with a friend
- PATCH/ friends/requests/:id/accept : Accept a pending friend request 
- PATCH/ friends/ requests/:id/decline: Decline a pending friend request 
- DELETE/friends/:id: Remove a user from a friends list

##  Response codes

| Status | Meaning | Usage |
| ------ | ------- | ----- | 
| 200    | OK      | The request was successful|
| 201    | Created | resource was successfully created|
| 400    | Bad request | Missing required fields or invalid data|
| 401    | Unauthorised | Missing or expired JWT token| 
| 404    | Not found    | The requested resource does not exist|
| 500    | Server Error | Internal server error|
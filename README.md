# Operations Documentation

This document provides a deep dive into the architecture, database design and operations workflows for the Fooprint project.

## Architecture Diagram

[architecture Diagram](/images/Architecture%20Diagram%20-%20Copy%20of%20HLD.jpg)

The application is built in two separate parts. The React Native (Expo) mobile frontend communicates with a Node.js/Express server via a RESTful API. This structure makes the app faster and easier to update. 


## Database Schema

[Database Schema](/images/travel-log.jpg)

Our data is structured to support relational queries between users, their travel logs and photos. 

- **Users**: Stores user’s login details and their profile information
- **Countries**: A list of all 195 countries in the world. The app uses this to help the user pick where they have been.
- **Visited locations**: This connects Users to Countries. It is how the app knows which specific places the user has visited.
- **Trips**: This stores the details of the user’s journey, such as the name of the trip, the date and their personal notes.
- **Trip_Images**: This stores the link to the user’s photo. We save the photos online and connect them to a specific trips
- **Friendship**: This manages how users connect with each other. It tracks the relationship between users and shows the stats of their connection

## Testing

We use Jest and Superrtest to ensure both the backend logic and the frontend user interface remain stable. Our tests are divided into two primary directories:

1. Backend and logic (_tests_)

This folder contains tests for the "invsible" parts of the application. 

- Units Tests: Testing individual functions 
- Integration Tests: Using Supertest to ensure the API endpoints communicate correctly with the database and return the expected status code 

2. Screen and UI Testing (_tests_\screens)

This folder is dedicated to the React Native frontend. 

- Component Testing: Verifiying that UI elements (buttons, inputs, maps) render correctly. 
- Navigation Testing: Ensuring that when a user clicks "View Trip", the app correctly transitions to the Trip details. 
- User Flow: Testing if the forms (like register screen) capture input and display the correct validation errors


### Running tests

To excute the tests, use the following command from the root directory: 

- Run all tests: `npm test`

## Deployment 

Backend (Render):

- Ensure all environment variables (DB_URL, Cloudinary keys) are set in the Render.

Frontend (Expo/Netlify):

- Web versions are hosted on Netlify.
- Mobile builds are managed via expo 


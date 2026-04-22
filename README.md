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

We maintain high code quality through a combination of unit and integration tests 

### Running tests

All tests are located in the  _test_ folder
Ensure your local environment is set before running tests. 

- Run all tests: `npm run test`
- Run integration tests: `npm run test:integration`

### Writing New Tests: 

- Unit Tests: Used for testing utility functions (e.g., stats calculation or date formatting). Place these in  _test_ /units
- Integration Tests: Used to verify API endpoints using Supertest. Ensure you mock the database or use a dedicated test database to avoid polluting production data. 

## Deployment 

Backend (Render):

- Ensure all environment variables (DB_URL, Cloudinary keys) are set in the Render.

Frontend (Expo/Netlify):

- Web versions are hosted on Netlify.
- Mobile builds are managed via expo 


# footprint-mobile-app

A comprehensive travel tracking and social sharing application. 

## Concise Overview 
Footprint allows users to document their global adventures, manage specific trip itineraries with photos and visualise their progress on a global map. 
We built this app to be easy to use and very reliable. It includes secure login to protect the users information and real-time statistics so they can see exactly how much of the world they have explored. 

## Tech Stack 
| Category                    | Tools                                          | 
| --------------------------- | ---------------------------------------------- |
| Frontend                    | React Native, Expo, Taildwind CSS (NativeWind) |
| Backend                     | Node.js, Express, Axios                        |
| Database                    | PostgreSQL (Hosted via Supabase)               |
| Media Storage               | Cloudinary                                     |
| Testing                     | Jest, Supertest                                |
| Hosting                     | Netlify (frontend), Render (backend)           |

## Getting Started

###  Prerequisites 

Before beginning, ensure you have the following installed: 

- Node.js 
- Npm 
- A cloud-based database hosting platform such as Supabase or Neon
- Expo Go app on your mobile device 

### Installation

1.  **Clone the repository:** https://github.com/papaparadox/footprint-mobile-app.git

2. **Navigate to the project directory:** 
Navigate to the project with `cd footprint-mobile-app`

3. **Install dependencies:**
Run `npm install` to install all the dependencies for the project

###  Environment Setup 

Create a .env file in the root directory Do not commit this file to version control. Copy and fill in the following: 

#### **Server**
**PORT** = <port_of_your_choice>

#### **Database**
**DB_URL** = <your_database_connection_string>

#### **Authentication**
- BCRYPT_SALT_ROUNDS=15
- SECRET_TOKEN= <your_random_secure_jwt_secret>

#### **Media (cloudinary)**
- CLOUDINARY_CLOUD_NAME= <your_cloud_name>
- CLOUDINARY_API_KEY= <your_api_key>
- CLOUDINARY_API_SECRET= <your_api_secret>

### Database Installation
1. Setup your database
- Create a database instance on Supabase (or other cloud-based database hosting platform)
- Retrieve the connection string and copy it 
- Replace  your connection string into the `DB_URL` in your `.env`file
- Run `npm run setup-db` 


### Run the App
Start the Expo development server
- `npx expo start` 

##  You are now ready to use the backend on your machine!

## Links to other docs:

- API documentation: Endpoints and Response Codes
- Operations documentation

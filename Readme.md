Bellcorp Expense Tracker - Full Stack Application

Live Links and Video Walkthrough
Frontend Live Application: https://expense-tracker-mu-kohl-53.vercel.app
Backend API URL: https://meeting-scheduler-backend-hjij.onrender.com
Video Presentation: https://drive.google.com/file/d/1anJKf_W5nK-X9umgeO-w1KNrYWztm83i/view?usp=sharing

Login credentials:
email: shauryan240701@gmail.com 
password: Wolverine@2470

Overview
This repository contains the complete full-stack codebase for the Bellcorp Personal Expense Tracker. It is structured as a monorepo, containing both the React frontend and the Node.js backend. The application is designed to provide a highly responsive, premium user experience for managing personal finances.

Technology Stack
Frontend: React.js, Vite, React Router DOM, Recharts, Custom CSS
Backend: Node.js, Express.js, MongoDB, Mongoose, JSON Web Tokens for authentication
Deployment: Vercel for the frontend and Render for the backend

Key Features
User Authentication: Secure registration and login using JWT and encrypted passwords.
Premium Dashboard: Custom glassmorphism design with staggered entrance animations and dynamic data visualization using Recharts.
Transaction Explorer: Advanced filtering by text, category, date range, and minimum/maximum amounts.
Server-Side Pagination: Scalable data fetching ensuring the application remains fast even with thousands of records.
State Persistence: Utilizes session storage to remember user search filters and scroll position during navigation.

Repository Structure
The project is divided into two main directories:
frontend: Contains the React application code.
backend: Contains the Node.js API and database connection logic.

Local Setup Instructions

Backend Setup

Open your terminal and navigate to the backend directory.

Run npm install to download all required dependencies.

Create a .env file based on the provided .env.example file, adding your MongoDB connection string and JWT Secret.

Run npm run dev to start the server on localhost port 5000.

Frontend Setup

Open a new terminal window and navigate to the frontend directory.

Run npm install to download all required dependencies.

Create a .env file and add your VITE_API_URL pointing to your backend server.

Run npm run dev to start the React development server.

Deployment Configuration
The backend is configured to be deployed on Render by setting the root directory to the backend folder. The frontend is configured for Vercel by setting the root directory to the frontend folder and injecting the live Render URL into the environment variables.

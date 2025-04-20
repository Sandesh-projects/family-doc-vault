FamilyDocVault
FamilyDocVault is a secure web application built with the MERN stack (MongoDB, Express.js, React, Node.js) designed to help users securely store, manage, and share important family documents with trusted family members.
Features
User Authentication: Secure registration and login using JWT (JSON Web Tokens).
Profile Management: Users can view and edit their profile information.
Family Member Linking: Users can link other registered users as family members using email or Aadhaar number.
Document Upload: Securely upload various document types (images, PDFs, documents).
Document Management: View a list of uploaded documents, filter by owned or shared documents.
Document Details: View details of a specific document.
Document Download: Download uploaded documents.
Document Metadata Editing: Edit document type and description.
Document Deletion: Delete owned documents.
Document Sharing: Share owned documents with linked family members.
Role-Based Access (Basic): Documents are primarily owned by the uploader, with sharing mechanisms for access control.
Logging: Server-side logging using Winston.
Technologies Used
Backend:
Node.js
Express.js
MongoDB (with Mongoose ODM)
JWT (JSON Web Tokens) for authentication
Bcryptjs for password hashing
Multer for handling multipart/form-data (file uploads)
Winston for logging
Nodemon for development server auto-restarts
Frontend (Vite React App):
React (with Hooks)
Vite (Build tool)
React Router DOM for navigation
Axios for API calls
Bootstrap & React-Bootstrap for UI components and styling
JWT-decode for decoding JWTs on the client side
Setup Instructions
Follow these steps to set up and run the project on your personal computer.
Prerequisites
Node.js and npm: Make sure you have Node.js and npm (Node Package Manager) installed. You can download them from nodejs.org. npm is included with Node.js. (Alternatively, you can use Yarn).
MongoDB: You need a running MongoDB instance. You can install MongoDB locally (MongoDB Community Server) or use a cloud-based service like MongoDB Atlas (provides a free tier).

1. Clone the Repository
   Assuming your project is in a Git repository, clone it to your local machine:
   git clone <repository_url>
   cd family-doc-vault

2. Backend Setup
   Navigate into the backend directory:
   cd backend

Install backend dependencies:
npm install

# or yarn install

Create a .env file in the backend directory and add the following environment variables. Replace the placeholder values with your actual configuration.
NODE_ENV=development # or production
PORT=5000 # Or any port you prefer
MONGO_URI=mongodb://localhost:27017/familydocvault # Your MongoDB connection string
JWT_SECRET=your_jwt_secret_key # A strong, random secret key for JWT
JWT_EXPIRE=30d # JWT expiry time (e.g., 30 days)

# Add any other backend specific environment variables here

Important: Create an uploads folder directly inside the backend directory. This folder is used by Multer to store uploaded files.
mkdir uploads

3. Frontend Setup
   Navigate into the frontend-vite directory:
   cd ../frontend-vite

Install frontend dependencies:
npm install

# or yarn install

Create a .env file in the frontend-vite directory and add the following environment variable. This tells your frontend where your backend API is located.
VITE_REACT_APP_API_URL=http://localhost:5000 # Match the backend PORT

# Add any other frontend specific environment variables here, prefixed with VITE\_

4. Run the Project
   You need to run both the backend and the frontend development servers concurrently.
   Start the Backend:
   Open a terminal, navigate to the backend directory, and run:
   cd backend
   npm run dev # Or nodemon server.js if you prefer

The backend server should start, typically showing a message like "Server running on port 5000" and "MongoDB Connected".
Start the Frontend:
Open a new terminal, navigate to the frontend-vite directory, and run:
cd frontend-vite
npm run dev # Or yarn dev

The Vite development server should start and provide a local URL (e.g., http://localhost:5173/). Open this URL in your web browser.
Usage
Register: Create a new user account.
Login: Log in with your registered credentials.
Profile: View and edit your profile, including linking family members.
Family Members: Manage your linked family members by adding or removing them.
Documents: Upload new documents, view your owned and shared documents, view details, download, edit metadata, delete (if owned), and share with linked family members.
Notes
Ensure your MongoDB instance is running before starting the backend.
Keep your JWT secret key secure and do not share it.
For production deployment, you would typically build the frontend (npm run build in frontend-vite) and serve the static files, often from the same server as the backend or a separate static hosting service. Environment variables would also be configured differently in a production environment.
Error handling and validation can always be further enhanced.
This README provides a comprehensive guide for anyone looking to understand, set up, and run your FamilyDocVault project.

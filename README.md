FamilyDocVaultFamilyDocVault is a secure web application designed to store, manage, and share important family documents within a trusted network of family members. Built using the MERN stack, it provides a robust platform for digital document safekeeping and controlled access.FeaturesUser Authentication: Secure user registration and login using JSON Web Tokens (JWT).Profile Management: Users can view and update their personal profile details.Family Member Linking: Functionality to connect with other registered users as family members via email or Aadhaar number.Document Upload: Secure uploading of various document file types.Document Listing & Filtering: View documents owned by the user or shared with them, with options to filter the list.Document Details & Preview: Access detailed information about a specific document.Document Download: Securely download document files.Document Metadata Editing: Update document type and description.Document Deletion: Remove owned documents from the system.Document Sharing: Share specific owned documents with selected linked family members.Basic Access Control: Authorization checks ensure users can only access documents they own or are explicitly shared with.Technologies UsedThis project is built using the following key technologies:Backend:Node.js & Express.js: For the server-side runtime and RESTful API.MongoDB & Mongoose: As the NoSQL database and Object Data Modeling (ODM) library.JWT (jsonwebtoken): For stateless authentication.Bcryptjs: For secure password hashing.Multer: Middleware for handling multipart/form-data, primarily for file uploads.Winston: A versatile logging library.Nodemon: A utility that monitors for changes in your source and automatically restarts the server (used in development).Frontend (Vite React App):React: The JavaScript library for building the user interface.Vite: A fast build tool for modern web development.React Router DOM: For declarative routing in the React application.Axios: A promise-based HTTP client for making API requests.Bootstrap & React-Bootstrap: For responsive UI components and styling.jwt-decode: A small library to decode JWTs on the client side.Setup InstructionsFollow these steps to get the FamilyDocVault project running on your local machine.PrerequisitesEnsure you have the following installed:Node.js and npm: Download from nodejs.org. npm is included.MongoDB: Install MongoDB Community Server locally or use a cloud service like MongoDB Atlas.Git: Download from git-scm.com.1. Clone the RepositoryOpen your terminal or command prompt and clone the project repository:git clone <repository_url>
cd family-doc-vault 2. Backend SetupNavigate into the backend directory:cd backend
Install the backend dependencies:npm install

# or yarn install

Create a file named .env in the backend directory. Copy and paste the following content, replacing the placeholder values with your actual configuration:NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/familydocvault
JWT_SECRET=your_very_strong_and_random_jwt_secret_key
JWT_EXPIRE=30d

# Add other backend specific variables here

Important: Create an uploads folder directly inside the backend directory. This folder is essential for storing uploaded documents.mkdir uploads 3. Frontend SetupNavigate into the frontend-vite directory:cd ../frontend-vite
Install the frontend dependencies:npm install

# or yarn install

Create a file named .env in the frontend-vite directory. Add the following variable, ensuring the URL matches your backend's port:VITE_REACT_APP_API_URL=http://localhost:5000

# Add other frontend specific variables here, prefixed with VITE\_

4. Run the ProjectYou need to start both the backend server and the frontend development server.Start the Backend Server:Open a terminal, go to the backend directory, and run:cd backend
   npm run dev

# or nodemon server.js

You should see messages indicating the server is running and connected to MongoDB.Start the Frontend Server:Open a new terminal, go to the frontend-vite directory, and run:cd frontend-vite
npm run dev

# or yarn dev

Vite will start the development server and provide a local URL (e.g., http://localhost:5173/). Open this URL in your web browser to access the application.UsageOnce both servers are running and you open the frontend URL:Register a new user account.Login using your credentials.Explore the Profile page to view and edit your details and manage family members.Use the Documents section to upload, view, download, edit, delete, and share documents.Link other registered users as family members via their email or Aadhaar number on the Manage Family Members page.NotesEnsure your MongoDB server is running before starting the backend.The .env files should be kept confidential and not committed to your repository.For production deployment, the process would involve building the frontend (e.g., npm run build) and setting up a production-ready server environment for both the backend and the static frontend files.Consider adding more robust input validation and error handling for production use.

// frontend-vite/src/App.jsx
import React from "react";
import AppRoutes from "./routes.jsx"; // Import the component that defines your routes
import Header from "./components/Layout/Header.jsx"; // Import the Header component
import Footer from "./components/Layout/Footer.jsx"; // Import the Footer component

// App component serves as the main layout wrapper
function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      {" "}
      {/* Use Bootstrap flex classes for sticky footer */}
      <Header /> {/* Render the Header */}
      {/* Main content area */}
      {/* flex-grow-1 makes this div take up available vertical space */}
      {/* container, mt-4, mb-4 are Bootstrap classes for layout and spacing */}
      <main className="flex-grow-1 container mt-4 mb-4">
        <AppRoutes /> {/* Render the component that handles all routing */}
      </main>
      <Footer /> {/* Render the Footer */}
    </div>
  );
}

export default App;

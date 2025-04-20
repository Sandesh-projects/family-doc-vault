// frontend/src/components/Layout/Footer.jsx
import React from "react";

// Footer component
function Footer() {
  const currentYear = new Date().getFullYear(); // Get the current year dynamically

  return (
    <footer className="bg-light text-center text-lg-start mt-auto py-3">
      {" "}
      {/* Bootstrap classes for styling and sticky footer */}
      <div className="container">
        {" "}
        {/* Use container for alignment */}
        <div className="text-center">
          {" "}
          {/* Center the text */}
          &copy; {currentYear} FamilyDocVault. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;

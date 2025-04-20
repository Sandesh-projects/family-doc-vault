// frontend/src/components/Profile/ProfileView.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Use Link for navigation
import { Card, Button, ListGroup, Alert, Spinner } from "react-bootstrap"; // Import Bootstrap components
import { useAuth } from "../../context/AuthContext"; // Import useAuth hook
import userService from "../../services/userService"; // Import user service

// ProfileView component to display user profile details
function ProfileView() {
  // State for the fetched user profile data
  const [userProfileData, setUserProfileData] = useState(null); // State for the detailed family member user objects
  const [detailedFamilyMembers, setDetailedFamilyMembers] = useState([]); // New state for detailed members

  const [loading, setLoading] = useState(true); // Loading state for main profile
  const [loadingFamily, setLoadingFamily] = useState(false); // Loading state for family member details
  const [error, setError] = useState(""); // Error state // Use useAuth hook to check authentication status and potentially get basic user info

  const { isAuthenticated, user } = useAuth(); // Effect to fetch the full user profile data and then family member details

  useEffect(() => {
    // Only fetch if authenticated
    if (!isAuthenticated || !user) {
      setLoading(false);
      setLoadingFamily(false);
      return;
    }

    const fetchUserProfileAndFamily = async () => {
      setLoading(true); // Start loading main profile
      setLoadingFamily(false); // Reset family loading
      setError(""); // Clear previous errors
      setUserProfileData(null); // Clear previous data
      setDetailedFamilyMembers([]); // Clear previous detailed members

      try {
        // --- 1. Fetch the current user's profile ---
        const userProfileResponse = await userService.getMe();

        if (userProfileResponse?.success && userProfileResponse.data) {
          const fetchedProfile = userProfileResponse.data;
          setUserProfileData(fetchedProfile); // Set the main profile data
          console.log(`Fetched user profile for ${user._id}`); // Use console.log // --- 2. Fetch details for each family member ID ---

          if (
            fetchedProfile.familyMembers &&
            fetchedProfile.familyMembers.length > 0
          ) {
            setLoadingFamily(true); // Start loading family member details
            try {
              const memberDetailsPromises = fetchedProfile.familyMembers.map(
                (memberId) => userService.getUserById(memberId) // Call the service to get details for each ID
              );

              const memberResponses = await Promise.all(memberDetailsPromises); // Run calls in parallel

              const fetchedMembers = memberResponses
                .filter((res) => res?.success && res.data) // Filter out failed fetches
                .map((res) => res.data); // Extract the user data

              setDetailedFamilyMembers(fetchedMembers); // Set state with detailed member objects
              console.log(
                `Fetched details for ${fetchedMembers.length} family members.`
              ); // Use console.log
            } catch (familyErr) {
              // Handle errors fetching individual family member details
              console.error("Error fetching family member details:", familyErr); // Use console.error
              setError("Failed to load some family member details."); // Set a specific error for this part
              setDetailedFamilyMembers([]); // Clear list on error
            } finally {
              setLoadingFamily(false); // Stop loading family members
            }
          } else {
            setDetailedFamilyMembers([]); // No family members linked
            setLoadingFamily(false);
            console.log("No family members linked for this user."); // Use console.log
          }
        } else {
          // Handle API specific failure message if success: false for main profile
          setError(
            userProfileResponse?.message || "Failed to fetch profile data."
          );
          setUserProfileData(null);
          setDetailedFamilyMembers([]);
          setLoadingFamily(false); // Ensure family loading is also stopped
        }
      } catch (err) {
        // Handle API call errors for main profile fetch
        setError(
          err.message || "An unexpected error occurred while fetching profile."
        );
        setUserProfileData(null);
        setDetailedFamilyMembers([]);
        setLoadingFamily(false);
      } finally {
        setLoading(false); // Stop loading main profile
        // Note: setLoadingFamily is handled within the try/catch for family members
      }
    };

    fetchUserProfileAndFamily(); // Call the combined fetch function
  }, [isAuthenticated, user?._id]); // Re-run if isAuthenticated changes or user ID changes

  // Determine overall loading state
  const overallLoading = loading || loadingFamily; // If loading, show a spinner

  if (overallLoading) {
    return (
      <div className="d-flex justify-content-center mt-5">
               {" "}
        <Spinner animation="border" role="status">
                   {" "}
          <span className="visually-hidden">
            {loading ? "Loading Profile..." : "Loading Family Members..."}{" "}
            {/* More specific loading text */}
          </span>
                 {" "}
        </Spinner>
             {" "}
      </div>
    );
  } // If there's an error after loading, show an alert

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  } // If no profile data after loading, maybe show a message (shouldn't happen with getMe if successful)

  if (!userProfileData) {
    return <Alert variant="info">Could not load profile data.</Alert>;
  } // Render the profile details

  return (
    <Card>
                  {/* Bootstrap Card for profile display */}     {" "}
      <Card.Body>
               {" "}
        <Card.Title className="text-center mb-4">Your Profile</Card.Title>      
          {/* Centered Title */}        {/* Profile Information List */}       {" "}
        <ListGroup variant="flush">
                              {/* ListGroup for cleaner layout */}         {" "}
          <ListGroup.Item>
                        <strong>Name:</strong> {userProfileData.name}         {" "}
          </ListGroup.Item>
                   {" "}
          <ListGroup.Item>
                        <strong>Email:</strong> {userProfileData.email}         {" "}
          </ListGroup.Item>
                   {" "}
          <ListGroup.Item>
                        <strong>Aadhaar Number:</strong>            {" "}
            {userProfileData.aadhaarNumber || "Not Linked"}         {" "}
          </ListGroup.Item>{" "}
                    {/* Display 'Not Linked' if null */}         {" "}
          <ListGroup.Item>
                        <strong>Family Members:</strong>           {" "}
            {/* Display list of detailed family members */}           {" "}
            {detailedFamilyMembers && detailedFamilyMembers.length > 0 ? ( // Use detailedFamilyMembers state
              <ListGroup variant="flush" className="mt-2">
                               {" "}
                {detailedFamilyMembers.map(
                  (
                    member // Map over detailed member objects
                  ) => (
                    <ListGroup.Item key={member._id}>
                                         {" "}
                      {/* Link to view family member profile */}               
                         {" "}
                      <Link
                        to={`/profile/${member._id}`}
                        className="text-decoration-none"
                      >
                        {" "}
                        {/* Link to profile route */}                     {" "}
                        <strong>{member.name || "Unnamed User"}</strong> (
                        {member.email}) {/* Display name and email */}         
                                 {" "}
                      </Link>
                                       {" "}
                    </ListGroup.Item>
                  )
                )}
                             {" "}
              </ListGroup>
            ) : (
              <p className="mt-2 mb-0">No family members linked yet.</p>
            )}
                     {" "}
          </ListGroup.Item>
                   {" "}
          <ListGroup.Item>
                        <strong>Member Since:</strong>            {" "}
            {new Date(userProfileData.createdAt).toLocaleDateString()}         {" "}
          </ListGroup.Item>{" "}
                    {/* Format date */}       {" "}
        </ListGroup>
                {/* Action Buttons */}       {" "}
        <div className="mt-4 text-center">
                              {/* Center buttons */}         {" "}
          <Button
            as={Link}
            to="/profile/edit"
            variant="primary"
            className="me-2"
          >
                                    {/* Link to Edit Profile */}            Edit
            Profile          {" "}
          </Button>
                   {" "}
          <Button as={Link} to="/profile/family" variant="secondary">
                                    {/* Link to Manage Family Members */}       
                Manage Family Members          {" "}
          </Button>
                 {" "}
        </div>
             {" "}
      </Card.Body>
         {" "}
    </Card>
  );
}

export default ProfileView;

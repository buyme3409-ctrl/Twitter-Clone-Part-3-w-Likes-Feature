import { useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "usehooks-ts";
import ProfileSideBar from "../components/ProfileSideBar";
import ProfileMidBody from "../components/ProfileMidBody";

export default function ProfilePage() {
    const [authToken, setAuthToken] = useLocalStorage("authToken", "");
    const navigate = useNavigate();


    // Check for authToken immediately when the component mount and whenever authToken changes
    useEffect(() => {
        if (!authToken) {
            navigate("/login"); // Redirect to login if no authToken is found
        }
    }, [authToken, navigate]);

    const handleLogout = () => {
        setAuthToken(""); // Clear Token from local storage
    };

    return (
        <>
            <Container>
                <Row>
                    <ProfileSideBar handleLogout={handleLogout} />
                    <ProfileMidBody />
                </Row>
            </Container>
        </>
    );
}


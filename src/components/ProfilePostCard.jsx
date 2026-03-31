import { useEffect, useState } from "react";
import { Button, Col, Image, Row } from "react-bootstrap";

export default function ProfilePostCard({ content, post_Id }) {
    const [likes, setLikes] = useState(0);
    const pic = "https://pbs.twimg.com/profile_images/1587405892437221376/h167Jlb2_400x400.jpg";


    useEffect(() => {
        fetch(`https://f221ca5e-27cc-4552-8da5-7c88b2b75324-00-1wftuepvbx8fy.pike.replit.dev/likes/post/${post_Id}`)
            .then((response) => response.json())
            .then((data) => setLikes(data.length))
            .catch((error) => console.error("Error:", error));
    }, [post_Id]);

    return (
        <Row
            className="p-3"
            style={{ borderTop: "1px solid #D3D3D3", borderBottom: "1px solid #D3D3D3" }}>
            <Col sm={1}>
                <Image src={pic} fluid roundedCircle />
            </Col>

            <Col>
                <strong>Brandon</strong>
                <span> @brandon.herrera · May 25</span>
                <p>{content}</p>
                <div className="d-flex justify-content-between">
                    <Button variant="light">
                        <i className="bi bi-chat"></i>
                    </Button>
                    <Button variant="light">
                        <i className="bi bi-repeat"></i>
                    </Button>
                    <Button variant="light">
                        <i className="bi bi-heart"> {likes}</i>
                    </Button>
                    <Button variant="light">
                        <i className="bi bi-graph-up"></i>
                    </Button>
                    <Button variant="light">
                        <i className="bi bi-upload"></i>
                    </Button>



                </div>
            </Col>
        </Row>
    )
}
import { Container, Row, Col, Button } from "react-bootstrap";
import "./notFound.css";

const NotFound = () => {
  return (
    <Container
      fluid
      className="not-found-container d-flex align-items-center  justify-content-center"
    >
      <Row className="text-center">
        <Col>
          <h1 className="display-1 text-danger">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-4">
            Oops! The page you are looking for doesn&apos;t exist.
          </p>
          <p className="text-muted mb-4">Or maybe we&apos;re working on it!</p>
          <Button variant="primary" href="/dashboard">
            Go to Homepage
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;

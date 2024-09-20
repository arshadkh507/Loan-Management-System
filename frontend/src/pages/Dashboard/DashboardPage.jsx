import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import {
  FaDollarSign,
  FaUsers,
  FaChartLine,
  FaMoneyCheckAlt,
} from "react-icons/fa";
import "../../assets/css/pagesStyle.css";
import "./dashboardPage.css";
import { useGetDashboardDataQuery } from "../../app/loanApi";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const DashboardPage = () => {
  // Use the RTK Query hook to fetch data
  const { data, error, isLoading } = useGetDashboardDataQuery();
  return (
    <Container fluid className="mt-4 page-container ">
      <h1 className="mb-4 page-heading">Dashboard</h1>
      <hr className="custom-hr" />

      {isLoading && <LoadingSpinner />}
      {error && <Alert variant="danger">Failed to load data.</Alert>}

      <Row>
        {/* Displays the total amount of loans issued. */}
        <Col md={3}>
          <Card className="text-center shadow-sm mb-4">
            <Card.Body>
              <FaDollarSign size={50} className="mb-3 icon" />
              <Card.Title>Total Loans</Card.Title>
              <Card.Text>{data?.totalLoans || 0}</Card.Text>
              {/* Dynamically fetch total loans */}
            </Card.Body>
          </Card>
        </Col>

        {/* Shows the total number of users in the system. */}
        <Col md={3}>
          <Card className="text-center shadow-sm mb-4">
            <Card.Body>
              <FaUsers size={50} className="mb-3 icon" />
              <Card.Title>Total Users</Card.Title>
              <Card.Text>{data?.totalUsers || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Shows the total payments made this month. */}
        <Col md={3}>
          <Card className="text-center shadow-sm mb-4">
            <Card.Body>
              <FaChartLine size={50} className="mb-3 icon" />
              <Card.Title>Monthly Payments</Card.Title>
              <Card.Text>{data?.monthlyPayments || 0}</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Outstanding loans */}
        <Col md={3}>
          <Card className="text-center shadow-sm mb-4">
            <Card.Body>
              <FaMoneyCheckAlt size={50} className="mb-3 icon" />
              <Card.Title>Outstanding Loans</Card.Title>
              <Card.Text>{data?.outstandingLoans || 0}</Card.Text>{" "}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardPage;

// // src/pages/DashboardPage.js

// import { Container, Row, Col, Card } from "react-bootstrap";
// import {
//   FaDollarSign,
//   FaUsers,
//   FaChartLine,
//   FaFileInvoice,
// } from "react-icons/fa";
// import "../../assets/css/pagesStyle.css";
// import "./dashboardPage.css";

// const DashboardPage = () => {
//   return (
//     <Container fluid className="mt-4 page-container ">
//       <h1 className="mb-4 page-heading">Dashboard</h1>
//       <hr className="custom-hr" />
//       <Row>
//         {/* Displays the total amount of loans issued. */}
//         <Col md={3}>
//           <Card className="text-center shadow-sm mb-4">
//             <Card.Body>
//               <FaDollarSign size={50} className="mb-3 icon" />
//               <Card.Title>Total Loans</Card.Title>
//               <Card.Text>$120,000</Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>
//         {/* Shows the total number of users in the system. */}
//         <Col md={3}>
//           <Card className="text-center shadow-sm mb-4">
//             <Card.Body>
//               <FaUsers size={50} className="mb-3 icon" />
//               <Card.Title>Total Users</Card.Title>
//               <Card.Text>150</Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>
//         {/* Shows the total payments made this month. */}
//         <Col md={3}>
//           <Card className="text-center shadow-sm mb-4">
//             <Card.Body>
//               <FaChartLine size={50} className="mb-3 icon" />
//               <Card.Title>Monthly Payments</Card.Title>
//               <Card.Text>$25,000</Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>
//         {/* Displays the number of reports generated. */}
//         <Col md={3}>
//           <Card className="text-center shadow-sm mb-4">
//             <Card.Body>
//               <FaFileInvoice size={50} className="mb-3 icon" />
//               <Card.Title>Total Reports</Card.Title>
//               <Card.Text>20</Card.Text>
//             </Card.Body>
//           </Card>
//         </Col>
//       </Row>
//     </Container>
//   );
// };

// export default DashboardPage;

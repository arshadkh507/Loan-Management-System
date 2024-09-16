/* eslint-disable react/prop-types */
// /* eslint-disable react/prop-types */
import { Navbar, Nav, Dropdown } from "react-bootstrap";
import { FaBars, FaUser, FaSignOutAlt } from "react-icons/fa";
import { TiHome } from "react-icons/ti";
import "./header.css";

const Header = ({ toggleSidebar }) => {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm px-4 py-2">
      <Nav className="me-auto">
        <FaBars
          onClick={toggleSidebar}
          className="sidebar-toggle-icon d-lg-none"
          size={24}
        />
      </Nav>

      <Nav>
        <Dropdown align="end">
          <Dropdown.Toggle
            className="border"
            variant="light"
            id="dropdown-basic"
          >
            <FaUser size={24} />
          </Dropdown.Toggle>
          <Dropdown.Menu className="position-absolute">
            <Dropdown.Item href="#/profile">
              <FaUser className="me-2" /> Profile
            </Dropdown.Item>
            <Dropdown.Item href="#/dashboard">
              <TiHome className="me-2" /> Dashboard
            </Dropdown.Item>
            <Dropdown.Item href="#/logout">
              <FaSignOutAlt className="me-2" /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Nav>
    </Navbar>
  );
};

export default Header;

/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaDollarSign,
  FaUser,
  FaDatabase,
  FaChevronLeft,
  FaChevronUp,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaHome,
  FaArrowRight,
  FaCog,
} from "react-icons/fa";
import "./sidebar.css";
import useWindowWidth from "../../customeHooks/useWindowWidth";

const Sidebar = ({
  isSidebarShow,
  toggleSidebar,
  isCollapsed,
  toggleCollapse,
}) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);
  const windowWidth = useWindowWidth();
  const [dropdownOpen, setDropdownOpen] = useState({
    loans: false,
    loanPayments: false,
    customers: false,
    reports: false,
    settings: false,
  });

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [activeTab, location.pathname]);

  const toggleSidebarCollapse = () => {
    toggleCollapse();

    // close dropdowns
    setDropdownOpen((prev) => {
      const updatedState = Object.keys(prev).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});

      return updatedState;
    });
  };

  const toggleSidebarShow = () => {
    toggleSidebar();
  };

  const toggleDropdown = (tab) => {
    setDropdownOpen((prev) => {
      const updatedDropdowns = Object.keys(prev).reduce((acc, key) => {
        acc[key] = key === tab ? !prev[tab] : false;
        return acc;
      }, {});
      return updatedDropdowns;
    });
  };

  const handleLinkClick = () => {
    if (windowWidth < 992) {
      toggleSidebar();
    }
  };

  return (
    <div
      className={`sidebar ${isCollapsed ? "collapsed" : "hide-sidebar"} ${
        isSidebarShow ? "sidebar-show" : ""
      } `}
    >
      <div className="sidebar-header">
        <span className="logo">Loan System</span>
        {windowWidth > 992 && (
          <button
            className="btn btn-link toggle-btn"
            onClick={toggleSidebarCollapse}
          >
            {isCollapsed ? <FaAngleDoubleRight /> : <FaAngleDoubleLeft />}
          </button>
        )}
        {windowWidth < 992 && (
          <button
            className="btn btn-link toggle-btn"
            onClick={toggleSidebarShow}
          >
            <FaAngleDoubleLeft />
          </button>
        )}
      </div>
      <div className="sidebar-menu">
        <Link
          to="/"
          className={`menu-item ${activeTab === "/" ? "active" : ""}`}
          onClick={handleLinkClick}
        >
          <FaHome className="tab-icon" />
          <span className="menu-text">Dashboard</span>
        </Link>

        <div className={`menu-item`} onClick={() => toggleDropdown("loans")}>
          <FaDollarSign className="tab-icon" />
          <span className="menu-text">Loans</span>
          {dropdownOpen.loans ? (
            <FaChevronUp className="dropdown-icon" />
          ) : (
            <FaChevronLeft className="dropdown-icon" />
          )}
        </div>
        {dropdownOpen.loans && (
          <div className={`dropdownMenu ${dropdownOpen.loans ? "show" : ""}`}>
            <Link
              to="/loans/add"
              className={`dropdownItem ${
                activeTab === "/loans/add" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Add Loan
            </Link>
            <Link
              to="/loans/details"
              className={`dropdownItem ${
                activeTab === "/loans/details" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Loan Details
            </Link>
          </div>
        )}

        <div
          className={`menu-item`}
          onClick={() => toggleDropdown("loanPayments")}
        >
          <FaDollarSign className="tab-icon" />
          <span className="menu-text">Loan Payments</span>
          {dropdownOpen.loanPayments ? (
            <FaChevronUp className="dropdown-icon" />
          ) : (
            <FaChevronLeft className="dropdown-icon" />
          )}
        </div>
        {dropdownOpen.loanPayments && (
          <div
            className={`dropdownMenu ${
              dropdownOpen.loanPayments ? "show" : ""
            }`}
          >
            <Link
              to="/loan-payments"
              className={`dropdownItem ${
                activeTab === "/loan-payments/add" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Add Loan Payment
            </Link>
            <Link
              to="/loan-payments/details"
              className={`dropdownItem ${
                activeTab === "/loan-payments/details" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Loan Payment Details
            </Link>
          </div>
        )}

        <div
          className={`menu-item`}
          onClick={() => toggleDropdown("customers")}
        >
          <FaUser className="tab-icon" />
          <span className="menu-text">Customers</span>
          {dropdownOpen.customers ? (
            <FaChevronUp className="dropdown-icon" />
          ) : (
            <FaChevronLeft className="dropdown-icon" />
          )}
        </div>
        {dropdownOpen.customers && (
          <div
            className={`dropdownMenu ${dropdownOpen.customers ? "show" : ""}`}
          >
            <Link
              to="/customers/add"
              className={`dropdownItem ${
                activeTab === "/customers/add" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Add Customer
            </Link>
            <Link
              to="/customers/details"
              className={`dropdownItem ${
                activeTab === "/customers/details" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Customer Details
            </Link>
          </div>
        )}

        <div className={`menu-item`} onClick={() => toggleDropdown("reports")}>
          <FaDatabase className="tab-icon" />
          <span className="menu-text">Reports</span>
          {dropdownOpen.reports ? (
            <FaChevronUp className="dropdown-icon" />
          ) : (
            <FaChevronLeft className="dropdown-icon" />
          )}
        </div>
        {dropdownOpen.reports && (
          <div className={`dropdownMenu ${dropdownOpen.reports ? "show" : ""}`}>
            <Link
              to="/reports/loan-report"
              className={`dropdownItem ${
                activeTab === "/reports/loan-report" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Loan Report
            </Link>
            <Link
              to="/reports/customer-report"
              className={`dropdownItem ${
                activeTab === "/reports/customer-report" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Customer Report
            </Link>
            <Link
              to="/reports/single-customer-report"
              className={`dropdownItem ${
                activeTab === "/reports/single-customer-report" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Single Customer
              Report
            </Link>
            <Link
              to="/reports/single-customer-ledger"
              className={`dropdownItem ${
                activeTab === "/reports/single-customer-ledger" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" />
              Customer Ledger
            </Link>
          </div>
        )}

        <div className={`menu-item`} onClick={() => toggleDropdown("settings")}>
          <FaCog className="tab-icon" />
          <span className="menu-text">Settings</span>
          {dropdownOpen.settings ? (
            <FaChevronUp className="dropdown-icon" />
          ) : (
            <FaChevronLeft className="dropdown-icon" />
          )}
        </div>
        {dropdownOpen.settings && (
          <div
            className={`dropdownMenu ${dropdownOpen.settings ? "show" : ""}`}
          >
            <Link
              to="/settings/payment-types"
              className={`dropdownItem ${
                activeTab === "/settings/payment-types" ? "active" : ""
              }`}
              onClick={handleLinkClick}
            >
              <FaArrowRight className="dropdownItemIcon" /> Payment Types
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

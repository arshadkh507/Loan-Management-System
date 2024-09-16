/* eslint-disable react/prop-types */
import { useState } from "react";
import "./layout.css";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import Sidebar from "../components/Sidebar/Sidebar";

const Layout = ({ children }) => {
  const [isSidebarShow, setIsSidebarShow] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarShow(!isSidebarShow);
  };
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`d-flex`} id="wrapper">
      <Sidebar
        isSidebarShow={isSidebarShow}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
        toggleCollapse={toggleCollapse}
      />
      {/* Main Content Area */}
      <div
        id="page-content-wrapper"
        className={`main-content ${isCollapsed ? "collapsed-sidebar" : ""} `}
      >
        <Header toggleSidebar={toggleSidebar} />
        <main className="container-fluid">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;

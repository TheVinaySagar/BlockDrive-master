import React from "react";
import { GoPlus, GoHome } from "react-icons/go";
import { LuMenu } from "react-icons/lu";
import { FiHardDrive } from "react-icons/fi";
import { FaCoins } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import {
  FaFileImage,
  FaFilePdf,
  FaFileAudio,
  FaFileVideo,
} from "react-icons/fa6";

const SideBar = ({
  setOpenComponent,
  logoSrc = "/assets/images/logo.png",
  logoAlt = "Brand Logo",
  brandName = "",
}) => {
  return (
    <div className="iq-sidebar sidebar-default sidebar-new glass-card">
      {/* Brand Logo */}
      <div className="d-flex align-items-center justify-content-between px-3 py-2 sidebar-header">
        <div className="header-logo d-flex align-items-center gap-3">
          <a className="d-flex align-items-center">
            <img
              src={logoSrc}
              className="img-fluid rounded-normal logo-img"
              alt={logoAlt}
              style={{ paddingTop: "12px", maxHeight: "60px", width: "auto" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "block";
              }}
            />
            <span className="brand-text ml-2 font-weight-bold">{brandName}</span>
          </a>
        </div>

        <div className="iq-menu-bt-sidebar toggle-btn">
          <i className="las wrapper-menu">
            <LuMenu />
          </i>
        </div>
      </div>

      <div>
        {/* Create New */}
        <div className="new-create select-dropdown input-prepend input-append">
          <div className="btn-group">
            <div
              onClick={() => setOpenComponent("Upload")}
              className="search-query selet-caption neon-btn"
            >
              <i className="pr-2">
                <GoPlus />
              </i>
              Create New
            </div>
          </div>
        </div>

        {/* Menu */}
        <nav className="iq-sidebar-menu">
          <ul id="iq-sidebar-toggle" className="iq-menu">
            {/* Dashboard */}
            <li className="active neon-item">
              <a onClick={() => setOpenComponent("Home")}>
                <i className="las">
                  <GoHome />
                </i>
                <span>Ledger</span>
              </a>
            </li>

            {/* D-Storage */}
            <li className="neon-item">
              <a
                href="#mydrive"
                className="collapsed"
                data-toggle="collapse"
                aria-expanded="false"
              >
                <i className="las">
                  <FiHardDrive />
                </i>
                <span>D-Storage</span>
                <i className="las iq-arrow-right arrow-active">
                  <IoIosArrowDown />
                </i>
                <i className="las iq-arrow-right arrow-hover">
                  <IoIosArrowUp />
                </i>
              </a>
              <ul
                id="mydrive"
                className="iq-submenu collapse"
                data-parent="#iq-sidebar-toggle"
              >
                <li>
                  <a onClick={() => setOpenComponent("MyImage")}>
                    <FaFileImage style={{ marginRight: "8px" }} />
                    <span>Images</span>
                  </a>
                </li>
                <li>
                  <a onClick={() => setOpenComponent("MyPDF")}>
                    <FaFilePdf style={{ marginRight: "8px" }} />
                    <span>PDFs</span>
                  </a>
                </li>
                <li>
                  <a onClick={() => setOpenComponent("MyAudio")}>
                    <FaFileAudio style={{ marginRight: "8px" }} />
                    <span>Audios</span>
                  </a>
                </li>
                <li>
                  <a onClick={() => setOpenComponent("MyVideo")}>
                    <FaFileVideo style={{ marginRight: "8px" }} />
                    <span>Videos</span>
                  </a>
                </li>
              </ul>
            </li>

            {/* Buy Credits */}
            <li className="neon-item">
              <a onClick={() => setOpenComponent("Price")}>
                <i className="las">
                  <FaCoins />
                </i>
                <span>Buy Credits</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Sidebar Styling */}
      <style jsx>{`
        .iq-sidebar {
          background: var(--card);
          border-right: 1px solid var(--card-border);
          height: 100vh;
          padding-top: 12px;
          transition: background 0.3s ease, border-color 0.3s ease;
        }

        .sidebar-header {
          border-bottom: 1px solid var(--card-border);
        }

        .logo-img {
          filter: drop-shadow(0 0 6px var(--accent-2));
        }

        .brand-text {
          font-size: 1.2rem;
          color: var(--accent);
          letter-spacing: 0.6px;
        }

        .neon-btn {
          background: linear-gradient(90deg, var(--accent), var(--accent-2));
          color: white;
          border-radius: 8px;
          padding: 8px 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 12px var(--accent-2);
        }

        .neon-btn:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 20px var(--accent-2), 0 0 40px var(--accent);
        }

        .iq-sidebar-menu ul li a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 18px;
          color: var(--text);
          font-weight: 500;
          transition: all 0.25s ease;
        }

        .iq-sidebar-menu ul li a:hover {
          background: linear-gradient(
            90deg,
            color-mix(in oklab, var(--accent) 20%, transparent),
            transparent
          );
          color: var(--accent);
          transform: translateX(6px);
          box-shadow: inset 3px 0 0 var(--accent);
        }

        .iq-sidebar-menu ul li.active a {
          color: var(--accent);
          font-weight: bold;
        }

        .iq-sidebar-menu ul li .las {
          font-size: 1.2rem;
        }

        .neon-item {
          transition: transform 0.3s ease;
        }

        .neon-item:hover {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
};

export default SideBar;

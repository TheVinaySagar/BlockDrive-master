import React, { useState } from "react";
import { IoIosArrowDown, IoMdClose } from "react-icons/io";
import { MdDateRange, MdOutlineTipsAndUpdates } from "react-icons/md";
import { FaClipboardList, FaBox, FaShareSquare } from "react-icons/fa";
import { CiBoxList } from "react-icons/ci";
import { ethers } from "ethers";

// 🔒 Import crypto helpers
import {
  decryptWithWalletKey,
} from "../../utils/crypto";

// INTERNAL IMPORT
import Error from "../Error/Error";

const MyDrive = ({ getAllUserFiles }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [decryptedUrls, setDecryptedUrls] = useState({});
  const [isDecryptingAll, setIsDecryptingAll] = useState(false);

  // Filter only images
  const Images = [];
  if (getAllUserFiles?.length) {
    getAllUserFiles.forEach((el) => {
      if (el.category === "Image") Images.push(el);
    });
  }

  // Helper → Detect MIME
  const detectMimeType = (file) => {
    if (file.originalType) return file.originalType; // ✅ use metadata if exists

    const name = file.fileName?.toLowerCase() || "";
    if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
    if (name.endsWith(".png")) return "image/png";
    if (name.endsWith(".gif")) return "image/gif";
    return "application/octet-stream"; // fallback
  };

  // ✅ Master Decrypt
  const handleDecryptAll = async () => {
    if (!Images.length) return;
    try {
      setIsDecryptingAll(true);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const newUrls = {};
      for (let i = 0; i < Images.length; i++) {
        const file = Images[i];
        try {
          const res = await fetch(file.fileHash);
          const encryptedBuffer = await res.arrayBuffer();

          const mimeType = detectMimeType(file);

          const blob = await decryptWithWalletKey(
            encryptedBuffer,
            signer,
            mimeType
          );
          const url = URL.createObjectURL(blob);
          newUrls[i] = url;
        } catch (err) {
          console.error("Decryption failed for", file.fileName, err);
        }
      }

      setDecryptedUrls(newUrls);
    } catch (err) {
      console.error("Decrypt all failed:", err);
      alert("Decryption failed. Make sure you’re using the correct wallet.");
    } finally {
      setIsDecryptingAll(false);
    }
  };

  // Modal functions
  const openImageModal = (file, index) => {
    setSelectedImage({
      ...file,
      decryptedUrl: decryptedUrls[index] || null,
    });
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setIsModalOpen(false);
  };

  return (
    <div className="content-page">
      <div className="container-fluid">
        {Images.length === 0 ? (
          <Error />
        ) : (
          <>
            {/* === Page Header === */}
            <div className="row">
              <div className="col-lg-12">
                <div className="d-flex align-items-center justify-content-between welcome-content mb-3">
                  <div className="navbar-breadcrumb">
                    <nav aria-label="breadcrumb">
                      <ul className="breadcrumb mb-0">
                        <li className="breadcrumb-item"><a>My Drive</a></li>
                        <li className="breadcrumb-item active" aria-current="page">Block Workshop</li>
                      </ul>
                    </nav>
                  </div>
                  <div className="d-flex align-items-center">
                    <div className="list-grid-toggle mr-4">
                      <span className="icon icon-grid i-grid"><FaBox /></span>
                      <span className="icon icon-grid i-list"><CiBoxList /></span>
                      <span className="label label-list">List</span>
                    </div>
                    <div className="dashboard1-dropdown d-flex align-items-center">
                      <div className="dashboard1-info rounded">
                        <a href="#calander" className="collapsed" data-toggle="collapse" aria-expanded="false">
                          <IoIosArrowDown />
                        </a>
                        <ul id="calander" className="iq-dropdown collapse list-inline m-0 p-0 mt-2">
                          <li><MdDateRange /></li>
                          <li><MdOutlineTipsAndUpdates /></li>
                          <li><FaClipboardList /></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* === Master Decrypt Button === */}
                <div className="mb-4 text-right">
                  <button
                    onClick={handleDecryptAll}
                    disabled={isDecryptingAll}
                    className="btn btn-success"
                  >
                    {isDecryptingAll ? "Decrypting All..." : "🔓 Decrypt All Images"}
                  </button>
                </div>
              </div>
            </div>

            {/* === Grid of Images === */}
            <div className="icon icon-grid i-grid">
              <div className="row">
                {Images.map((file, index) => (
                  <div key={index} className="col-lg-3 col-md-6 col-sm-6">
                    <div className="card card-block card-stretch card-height">
                      <div className="card-body image-thumb text-center">
                        <div className="mb-4 p-3 rounded iq-thumb">
                          {decryptedUrls[index] ? (
                            <img
                              src={decryptedUrls[index]}
                              className="img-fluid"
                              alt={file.fileName}
                              onClick={() => openImageModal(file, index)}
                              style={{ cursor: "pointer" }}
                            />
                          ) : (
                            <p style={{ color: "#aaa" }}>🔒 Encrypted</p>
                          )}
                        </div>
                        <div className="new_card_flex">
                          <h6>{file.fileName.slice(0, 18)}..</h6>
                          <span
                            onClick={() => navigator.clipboard.writeText(file.fileHash)}
                            style={{ cursor: "pointer" }}
                          >
                            <FaShareSquare />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* === Modal === */}
        {isModalOpen && selectedImage && (
          <div
            className="image-modal-overlay"
            onClick={closeImageModal}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.8)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              className="image-modal-content"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: "relative",
                maxWidth: "90%",
                maxHeight: "90%",
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <button
                onClick={closeImageModal}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                <IoMdClose />
              </button>
              <div style={{ textAlign: "center" }}>
                <h4 style={{ marginBottom: "15px", color: "#333" }}>
                  {selectedImage.fileName}
                </h4>
                {selectedImage.decryptedUrl ? (
                  <img
                    src={selectedImage.decryptedUrl}
                    alt={selectedImage.fileName}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "70vh",
                      objectFit: "contain",
                      borderRadius: "4px",
                    }}
                  />
                ) : (
                  <p style={{ color: "#999" }}>Decrypted preview not available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDrive;

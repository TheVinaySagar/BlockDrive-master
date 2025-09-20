
import React, { useState, useEffect, useCallback } from "react";
import {
  FaUpload,
  FaCloud,
  FaCheckCircle,
  FaTimesCircle,
  FaFile,
  FaImage,
  FaVideo,
  FaMusic,
  FaFilePdf,
  FaTrash,
  FaEye,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { ethers } from "ethers";

// 🔒 Encryption helper (make sure this path exists)
import { encryptFileWithWalletKey } from "../../utils/crypto";

// INTERNAL IMPORT
import { shortenAddress } from "../../utils/utils";

const Upload = ({
  CREATE_FILE,
  setLoader,
  notifySuccess,
  notifyError,
  setOpenComponent,
}) => {
  // -------------------- State --------------------
  const [fileURL, setFileURL] = useState("");
  const [userDetails, setUserDetails] = useState();
  const [uploadedFile, setUploadedFile] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const [file, setFile] = useState({
    _fileName: "",
    _description: "",
    _category: "",
    _isPublic: "",
  });

  // -------------------- Theme + User Init --------------------
  useEffect(() => {
    const userLoginData = JSON.parse(localStorage.getItem("currentUser"));
    setUserDetails(userLoginData);

    const detectTheme = () => {
      const body = document.body;
      const isDark =
        body.classList.contains("dark-theme") ||
        body.classList.contains("dark") ||
        body.getAttribute("data-theme") === "dark" ||
        localStorage.getItem("theme") === "dark" ||
        (typeof window !== "undefined" &&
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);
      setIsDarkTheme(isDark);
    };

    detectTheme();

    const observer = new MutationObserver(detectTheme);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const onStorage = () => detectTheme();
    window.addEventListener("storage", onStorage);

    const mq =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    if (mq) mq.addEventListener("change", detectTheme);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
      if (mq) mq.removeEventListener("change", detectTheme);
    };
  }, []);

  // -------------------- Helpers --------------------
  const handleFormFieldChange = (fileName, e) => {
    setFile({ ...file, [fileName]: e.target.value });
  };

  const getFileIcon = (category) => {
    switch (category) {
      case "Image":
        return <FaImage className="text-success" />;
      case "Video":
        return <FaVideo className="text-info" />;
      case "Audio":
        return <FaMusic className="text-warning" />;
      case "PDF":
        return <FaFilePdf className="text-danger" />;
      default:
        return <FaFile className="text-secondary" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setFileURL("");
    setUploadProgress(0);
    setFile({
      _fileName: "",
      _description: "",
      _category: "",
      _isPublic: "",
    });
  };

  // -------------------- Theme Colors --------------------
  const themeColors = {
    light: {
      background: "#ffffff",
      cardBg: "#ffffff",
      textPrimary: "#212529",
      textSecondary: "#6c757d",
      border: "#e0e6ed",
      dragActiveBg: "#f8f9fa",
      dragActiveBorder: "#007bff",
      shadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      previewBg: "#f8f9fa",
    },
    dark: {
      background: "#1a1a1a",
      cardBg: "#2d2d2d",
      textPrimary: "#ffffff",
      textSecondary: "#adb5bd",
      border: "#495057",
      dragActiveBg: "#343a40",
      dragActiveBorder: "#0d6efd",
      shadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
      previewBg: "#343a40",
    },
  };
  const currentTheme = isDarkTheme ? themeColors.dark : themeColors.light;

  // -------------------- ENCRYPT + UPLOAD --------------------
  // NOTE: As requested, .env use removed. Keys are hardcoded (NOT SAFE for production)
  const uploadToInfura = async (pickedFile) => {
    if (!pickedFile) return;
    try {
      setIsUploading(true);
      setUploadProgress(10);
      setLoader?.(true);

      notifySuccess?.("Encrypting & uploading to IPFS...");

      // 1) Get signer (MetaMask)
      if (!window.ethereum) {
        throw new Error("No wallet provider found. Please install MetaMask.");
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

// 2) Encrypt locally
setUploadProgress(25);
const { blob: encryptedBlob } = await encryptFileWithWalletKey(
  pickedFile,
  signer
);

// 3) Prepare FormData
setUploadProgress(40);
const formData = new FormData();
formData.append("file", encryptedBlob, `${pickedFile.name}.enc`);

// ✅ Save original metadata (very important for decryption later)
const pinataMetadata = {
  name: `${pickedFile.name}.enc`,
  keyvalues: {
    originalName: pickedFile.name,
    originalType: pickedFile.type || "application/octet-stream", // 👈 ALWAYS SAVE MIME
    bdrv_version: "1",
  },
};
formData.append("pinataMetadata", JSON.stringify(pinataMetadata));

// OPTIONAL: pinataOptions
const pinataOptions = { cidVersion: 1 };
formData.append("pinataOptions", JSON.stringify(pinataOptions));

      // 4) Upload to Pinata
      setUploadProgress(60);
      // ⚠️ Hardcoded keys as you demanded (NOT SAFE to ship to prod)
      const response = await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        maxBodyLength: Infinity,
        headers: {
          pinata_api_key: "c70e292916dbfcd0c5f6",
          pinata_secret_api_key:
            "ca8d3df960c6bf08690d916a27dc6ef0732423ee4c2fb37eb4797e05f2ded38a",
          "Content-Type": "multipart/form-data",
        },
        // Track upload progress (axios browser)
        onUploadProgress: (p) => {
          if (p.total) {
            const pct = Math.round((p.loaded / p.total) * 30) + 60; // 60→90
            setUploadProgress(Math.min(pct, 95));
          }
        },
      });

      // 5) Build gateway URL
      const ImgHash = `https://gateway.pinata.cloud/ipfs/${response?.data?.IpfsHash}`;
      setUploadProgress(100);
      setFileURL(ImgHash);

      notifySuccess?.("File uploaded successfully (encrypted)!");
    } catch (err) {
      console.error("Upload error:", err);
      notifyError?.(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to upload file. Please try again."
      );
    } finally {
      setIsUploading(false);
      setLoader?.(false);
    }
  };

  // -------------------- Dropzone --------------------
  const onDrop = useCallback(async (acceptedFiles) => {
  const first = acceptedFiles[0];
  if (!first) return;

  setUploadedFile(first);

  // Show local preview for images
  if (first.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileURL(e.target.result); // local preview only
    };
    reader.readAsDataURL(first);
  }

  // Auto-detect category
  const t = first.type || "";
  let category = "";
  if (t.startsWith("image/")) category = "Image";
  else if (t.startsWith("video/")) category = "Video";
  else if (t.startsWith("audio/")) category = "Audio";
  else if (t === "application/pdf") category = "PDF";
  else category = "File";
  setFile((prev) => ({ ...prev, _category: category }));

  // 🔒 Encrypt + upload
  await uploadToInfura(first);
}, []);


  const { getInputProps, getRootProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      maxSize: 500000000,
      multiple: false,
    });

  // -------------------- Create on-chain record --------------------
  const CALLING_CREATE = async (_file, _userDetails, _fileURL) => {
    try {
      await CREATE_FILE?.(_file, _userDetails, _fileURL);
      notifySuccess?.("Saved to blockchain!");
    } catch (e) {
      console.error(e);
      notifyError?.("Blockchain save failed.");
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="content-page">
      <div className="container-fluid">
        {/* =========================================================
            Header
        ========================================================== */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <h3 className="mb-1" style={{ color: currentTheme.textPrimary }}>
                  <FaCloud className="mr-2 text-primary" />
                  Upload to BlockDrive
                </h3>
                <p style={{ color: currentTheme.textSecondary }}>
                  Securely store your files on IPFS blockchain network
                </p>
              </div>

              <div className="d-flex align-items-center">
                <div className="theme-indicator mr-3">
                  {isDarkTheme ? (
                    <FaMoon className="text-warning" title="Dark Theme Active" />
                  ) : (
                    <FaSun className="text-warning" title="Light Theme Active" />
                  )}
                </div>

                <span
                  className="badge badge-info mr-2"
                  style={{
                    backgroundColor: isDarkTheme ? "#0d6efd" : "#17a2b8",
                    color: "white",
                  }}
                >
                  Credits: {userDetails?.credit || 0}
                </span>

                {userDetails?.credit === 0 && (
                  <button
                    onClick={() => setOpenComponent?.("Price")}
                    className="btn btn-outline-warning btn-sm"
                    style={{
                      borderColor: "#ffc107",
                      color: isDarkTheme ? "#ffc107" : "#856404",
                    }}
                  >
                    Buy Credits
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            Main Body
        ========================================================== */}
        {!uploadedFile ? (
          // ----------------- Upload (Drop) Section -----------------
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10">
              <div
                className="card border-0 shadow-lg"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  boxShadow: currentTheme.shadow,
                  border: `1px solid ${currentTheme.border}`,
                }}
              >
                <div className="card-body p-5">
                  <div
                    {...getRootProps()}
                    className={`upload-zone ${isDragActive ? "drag-active" : ""} ${
                      isDragReject ? "drag-reject" : ""
                    } ${isDarkTheme ? "dark-theme" : "light-theme"}`}
                    style={{
                      border: `3px dashed ${currentTheme.border}`,
                      borderRadius: "20px",
                      padding: "60px 40px",
                      textAlign: "center",
                      cursor: "pointer",
                      backgroundColor: isDragActive
                        ? currentTheme.dragActiveBg
                        : currentTheme.background,
                      borderColor: isDragActive
                        ? currentTheme.dragActiveBorder
                        : isDragReject
                        ? "#dc3545"
                        : currentTheme.border,
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                      color: currentTheme.textPrimary,
                    }}
                  >
                    <input {...getInputProps()} />

                    {/* Icon */}
                    <div className="upload-icon mb-4">
                      <FaCloud
                        size={80}
                        className={isDragActive ? "text-primary" : ""}
                        style={{
                          transition: "all 0.3s ease",
                          transform: isDragActive ? "scale(1.1)" : "scale(1)",
                          color: isDragActive
                            ? currentTheme.dragActiveBorder
                            : currentTheme.textSecondary,
                        }}
                      />
                    </div>

                    {/* Text */}
                    <div className="upload-text">
                      <h4
                        className="mb-3 font-weight-bold"
                        style={{ color: currentTheme.textPrimary }}
                      >
                        {isDragActive
                          ? "Drop your files here!"
                          : "Drag & Drop your files here"}
                      </h4>
                      <p className="mb-4" style={{ color: currentTheme.textSecondary }}>
                        or{" "}
                        <span
                          className="font-weight-bold"
                          style={{ color: currentTheme.dragActiveBorder }}
                        >
                          browse
                        </span>{" "}
                        to choose files
                      </p>
                    </div>

                    {/* Formats */}
                    <div className="supported-formats">
                      <div className="row justify-content-center">
                        <div className="col-auto">
                          <div className="format-item">
                            <FaImage className="text-success mb-2" size={24} />
                            <small className="d-block">Images</small>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="format-item">
                            <FaVideo className="text-info mb-2" size={24} />
                            <small className="d-block">Videos</small>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="format-item">
                            <FaMusic className="text-warning mb-2" size={24} />
                            <small className="d-block">Audio</small>
                          </div>
                        </div>
                        <div className="col-auto">
                          <div className="format-item">
                            <FaFilePdf className="text-danger mb-2" size={24} />
                            <small className="d-block">PDFs</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Size info */}
                    <div className="mt-4">
                      <small className="text-muted">Maximum file size: 500MB</small>
                    </div>

                    {/* Decoration */}
                    <div
                      className="upload-decoration"
                      style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        opacity: "0.1",
                        transform: "rotate(15deg)",
                      }}
                    >
                      <FaUpload size={40} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // ----------------- After File Picked -----------------
          <div className="row">
            {/* --------- Preview Card --------- */}
            <div className="col-xl-6 col-lg-6 mb-4">
              <div
                className="card h-100"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  boxShadow: currentTheme.shadow,
                  border: `1px solid ${currentTheme.border}`,
                }}
              >
                <div
                  className="card-header bg-primary text-white"
                  style={{
                    backgroundColor: isDarkTheme ? "#0d6efd" : "#007bff",
                    borderBottom: `1px solid ${currentTheme.border}`,
                  }}
                >
                  <h5 className="mb-0">
                    <FaEye className="mr-2" />
                    File Preview
                  </h5>
                </div>

                <div className="card-body" style={{ backgroundColor: currentTheme.cardBg }}>
                  {isUploading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary mb-3" role="status">
                        <span className="sr-only">Uploading...</span>
                      </div>
                      <h6>Uploading to IPFS...</h6>
                      <div className="progress mt-3">
                        <div
                          className="progress-bar bg-primary"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">{uploadProgress}% complete</small>
                    </div>
                  ) : fileURL ? (
                    <div className="preview-container">
                      {file._category === "Video" && (
                        <video
                          controls
                          className="w-100"
                          style={{ maxHeight: "300px", borderRadius: "8px" }}
                        >
                          <source src={fileURL} />
                          Your browser does not support video.
                        </video>
                      )}

                     {file._category === "Image" && (
  <div className="text-center">
    {uploadedFile ? (
      <img
        src={URL.createObjectURL(uploadedFile)}   // 👈 raw local preview
        alt="Preview"
        className="img-fluid rounded"
        style={{
          maxHeight: "300px",
          width: "100%",
          objectFit: "contain",
        }}
      />
    ) : (
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          height: "250px",
          border: "1px dashed #ccc",
          borderRadius: "8px",
          backgroundColor: currentTheme.previewBg,
        }}
      >
        <FaImage size={50} className="text-muted mb-3" />
        <p style={{ color: currentTheme.textSecondary, margin: 0 }}>
          🔒 Encrypted (Decrypt in MyDrive)
        </p>
      </div>
    )}
  </div>
)}



                      {file._category === "Audio" && (
                        <div className="text-center py-4">
                          <FaMusic size={80} className="text-warning mb-3" />
                          <audio controls className="w-100">
                            <source src={fileURL} />
                            Your browser does not support audio.
                          </audio>
                        </div>
                      )}

                      {file._category === "PDF" && (
                        <div className="text-center py-4">
                          <FaFilePdf size={80} className="text-danger mb-3" />
                          <p>PDF file ready</p>
                          <a
                            href={fileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-outline-primary"
                          >
                            View PDF
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      {getFileIcon(file._category)}
                      <p className="mt-2">Upload in progress...</p>
                    </div>
                  )}

                  {/* File meta mini card */}
                  {uploadedFile && (
                    <div className="mt-3 p-3 bg-light rounded">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          {getFileIcon(file._category)}
                          <div className="ml-3">
                            <h6 className="mb-1">{uploadedFile.name}</h6>
                            <small className="text-muted">
                              {formatFileSize(uploadedFile.size)} • {file._category}
                            </small>
                          </div>
                        </div>
                        {fileURL && <FaCheckCircle className="text-success" size={24} />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* --------- Form Card --------- */}
            <div className="col-xl-6 col-lg-6 mb-4">
              <div
                className="card h-100"
                style={{
                  backgroundColor: currentTheme.cardBg,
                  boxShadow: currentTheme.shadow,
                  border: `1px solid ${currentTheme.border}`,
                }}
              >
                <div
                  className="card-header bg-success text-white"
                  style={{
                    backgroundColor: isDarkTheme ? "#198754" : "#28a745",
                    borderBottom: `1px solid ${currentTheme.border}`,
                  }}
                >
                  <h5 className="mb-0">
                    <FaFile className="mr-2" />
                    File Details
                  </h5>
                </div>

                <div className="card-body" style={{ backgroundColor: currentTheme.cardBg }}>
                  <form onSubmit={(e) => e.preventDefault()}>
                    {/* Creator */}
                    <div className="form-group">
                      <label className="font-weight-bold" style={{ color: currentTheme.textPrimary }}>
                        Creator
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        style={{
                          backgroundColor: currentTheme.cardBg,
                          borderColor: currentTheme.border,
                          color: currentTheme.textPrimary,
                        }}
                        value={userDetails?.username || "Unknown"}
                        disabled
                      />
                    </div>

                    {/* Wallet */}
                    <div className="form-group">
                      <label className="font-weight-bold">Wallet Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={shortenAddress(userDetails?.address) || "Not connected"}
                        disabled
                      />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                      <label className="font-weight-bold">Category</label>
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">{getFileIcon(file._category)}</span>
                        </div>
                        <input
                          type="text"
                          className="form-control"
                          value={file._category || "Auto-detected"}
                          disabled
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="form-group">
                      <label className="font-weight-bold">Title *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter a descriptive title"
                        value={file._fileName}
                        onChange={(e) => handleFormFieldChange("_fileName", e)}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                      <label className="font-weight-bold">Description *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Describe your file..."
                        value={file._description}
                        onChange={(e) => handleFormFieldChange("_description", e)}
                        required
                      ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="form-group mt-4">
                      {userDetails?.credit === 0 ? (
                        <div className="text-center">
                          <button
                            onClick={() => setOpenComponent?.("Price")}
                            className="btn btn-warning btn-lg btn-block"
                          >
                            <FaUpload className="mr-2" />
                            Buy Credits to Save File
                          </button>
                          <small className="text-muted">
                            You need credits to save files on blockchain
                          </small>
                        </div> 
                      ) : (
                        <div>
                          <button
                            onClick={() => {
                              if (file._fileName && file._description && fileURL) {
                                CALLING_CREATE(file, userDetails, fileURL);
                              } else {
                                notifyError?.("Please fill all required fields");
                              }
                            }}
                            className="btn btn-success btn-lg btn-block"
                            disabled={
                              !file._fileName ||
                              !file._description ||
                              !fileURL ||
                              isUploading
                            }
                          >
                            <FaCheckCircle className="mr-2" />
                            Save to Blockchain
                          </button>

                          <button
                            onClick={resetUpload}
                            className="btn btn-outline-secondary btn-lg btn-block mt-2"
                          >
                            <FaTrash className="mr-2" />
                            Start Over
                          </button>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            Styles
        ========================================================== */}
        <style jsx>{`
          .upload-zone:hover {
            border-color: ${currentTheme.dragActiveBorder} !important;
            transform: translateY(-2px);
            box-shadow: 0 10px 25px ${
              isDarkTheme ? "rgba(13,110,253,0.2)" : "rgba(0,123,255,0.1)"
            };
          }
          .upload-zone.light-theme:hover {
            background-color: ${themeColors.light.dragActiveBg} !important;
          }
          .upload-zone.dark-theme:hover {
            background-color: ${themeColors.dark.dragActiveBg} !important;
          }
          .drag-active {
            border-color: ${currentTheme.dragActiveBorder} !important;
            background-color: ${
              isDarkTheme ? "rgba(13,110,253,0.1)" : "rgba(0,123,255,0.05)"
            } !important;
            transform: scale(1.02);
          }
          .drag-reject {
            border-color: #dc3545 !important;
            background-color: rgba(220, 53, 69, 0.05) !important;
          }
          .format-item {
            padding: 15px;
            text-align: center;
            border-radius: 8px;
            margin: 0 10px;
            transition: all 0.3s ease;
            color: ${currentTheme.textPrimary};
          }
          .format-item:hover {
            background-color: ${isDarkTheme ? "#404040" : "#f8f9fa"};
            transform: translateY(-2px);
          }
          .progress {
            height: 8px;
            border-radius: 4px;
            background-color: ${isDarkTheme ? "#495057" : "#e9ecef"};
          }
          .card {
            border: none;
            box-shadow: ${currentTheme.shadow};
            transition: all 0.3s ease;
            background-color: ${currentTheme.cardBg};
          }
          .card:hover {
            box-shadow: ${isDarkTheme
              ? "0 8px 15px rgba(0, 0, 0, 0.4)"
              : "0 8px 15px rgba(0, 0, 0, 0.15)"};
          }
          .form-control {
            background-color: ${currentTheme.cardBg};
            border-color: ${currentTheme.border};
            color: ${currentTheme.textPrimary};
          }
          .form-control:focus {
            background-color: ${currentTheme.cardBg};
            border-color: ${currentTheme.dragActiveBorder};
            color: ${currentTheme.textPrimary};
            box-shadow: 0 0 0 0.2rem ${isDarkTheme
              ? "rgba(13,110,253,0.25)"
              : "rgba(0,123,255,0.25)"};
          }
          .form-control:disabled {
            background-color: ${isDarkTheme ? "#1a1a1a" : "#e9ecef"};
            opacity: ${isDarkTheme ? "0.8" : "0.6"};
          }
          .input-group-text {
            background-color: ${currentTheme.cardBg};
            border-color: ${currentTheme.border};
            color: ${currentTheme.textPrimary};
          }
        `}</style>
      </div>
    </div>
  );
};

export default Upload;

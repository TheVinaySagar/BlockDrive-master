import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { MdDateRange, MdOutlineTipsAndUpdates } from "react-icons/md";
import { FaClipboardList, FaBox, FaShareSquare } from "react-icons/fa";
import { CiBoxList } from "react-icons/ci";
import { ethers } from "ethers";

// 🔒 import decrypt helper
import { decryptBytesWithWalletKey } from "../../utils/crypto";

// INTERNAL IMPORT
import Error from "../Error/Error";

const MyVideo = ({ getAllUserFiles }) => {
  const Videos = [];
  const [decryptedUrls, setDecryptedUrls] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [masterLoading, setMasterLoading] = useState(false);

  if (getAllUserFiles?.length) {
    getAllUserFiles.forEach((el) => {
      if (el.category === "Video") Videos.push(el);
    });
  }

  // 🛠️ Decrypt single
  const handleDecrypt = async (file, index, signer) => {
    try {
      setLoadingIndex(index);
      const res = await fetch(file.fileHash);
      const encryptedBuffer = await res.arrayBuffer();

      const blob = await decryptBytesWithWalletKey(
        encryptedBuffer,
        signer,
        file.originalType || "video/mp4"
      );
      const url = URL.createObjectURL(blob);

      setDecryptedUrls((prev) => ({ ...prev, [index]: url }));
    } finally {
      setLoadingIndex(null);
    }
  };

  // 🛠️ Decrypt all videos with one wallet approval
  const handleDecryptAll = async () => {
    try {
      setMasterLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const newUrls = {};
      for (let i = 0; i < Videos.length; i++) {
        const file = Videos[i];
        const res = await fetch(file.fileHash);
        const encryptedBuffer = await res.arrayBuffer();
        const blob = await decryptBytesWithWalletKey(
          encryptedBuffer,
          signer,
          file.originalType || "video/mp4"
        );
        newUrls[i] = URL.createObjectURL(blob);
      }
      setDecryptedUrls(newUrls);
    } catch (err) {
      console.error("Decrypt all videos failed:", err);
      alert("Batch video decryption failed.");
    } finally {
      setMasterLoading(false);
    }
  };

  return (
    <div className="content-page">
      <div className="container-fluid">
        {Videos.length === 0 ? (
          <Error />
        ) : (
          <>
            {/* Header with master button */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Video Files</h4>
              <button
                onClick={handleDecryptAll}
                disabled={masterLoading}
                className="btn btn-success"
              >
                {masterLoading ? "Decrypting All..." : "Decrypt All Videos"}
              </button>
            </div>

            <div className="row">
              {Videos.map((file, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div className="card card-block card-stretch card-height">
                    <div className="card-body text-center">
                      {decryptedUrls[index] ? (
                        <video controls width="100%" style={{ borderRadius: "6px" }}>
                          <source
                            src={decryptedUrls[index]}
                            type={file.originalType || "video/mp4"}
                          />
                        </video>
                      ) : (
                        <button
                          onClick={async () => {
                            const provider = new ethers.providers.Web3Provider(window.ethereum);
                            await provider.send("eth_requestAccounts", []);
                            const signer = provider.getSigner();
                            handleDecrypt(file, index, signer);
                          }}
                          disabled={loadingIndex === index}
                          className="btn btn-primary"
                        >
                          {loadingIndex === index ? "Decrypting..." : "Decrypt & Play"}
                        </button>
                      )}
                      <div className="new_card_flex mt-2">
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
          </>
        )}
      </div>
    </div>
  );
};

export default MyVideo;

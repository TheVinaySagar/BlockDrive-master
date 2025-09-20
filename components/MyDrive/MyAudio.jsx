import React, { useState } from "react";
import { FaBox, FaShareSquare } from "react-icons/fa";
import { CiBoxList } from "react-icons/ci";
import { ethers } from "ethers";

// 🔒 use the chunked/parallel decrypt helper
import { decryptWithWalletKey } from "../../utils/crypto";

// INTERNAL IMPORT
import Error from "../Error/Error";

const MyAudio = ({ getAllUserFiles }) => {
  const Audios = [];
  const [decryptedUrls, setDecryptedUrls] = useState({});
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [masterLoading, setMasterLoading] = useState(false);

  if (getAllUserFiles?.length) {
    getAllUserFiles.forEach((el) => {
      if (el.category === "Audio") Audios.push(el);
    });
  }

  // prefer metadata MIME; fallback to common audio MIME
  const pickMime = (file) => file.originalType || "audio/mpeg";

  // where did you store manifest? try several keys for compatibility
  const pickManifestCid = (file) =>
    file._manifestCid || file.manifestCid || file.manifestHash || file.manifest;

  // where did you store ciphertext URL/CID?
  const pickCipherUrl = (file) =>
    file._cipherUrl || file.fileHash || file.cipherUrl || file.cipherHash;

  // Single decrypt (with manifest)
  const handleDecrypt = async (file, index, signer) => {
    try {
      setLoadingIndex(index);

      const cipherUrl = pickCipherUrl(file);
      const manifestCid = pickManifestCid(file);
      if (!cipherUrl || !manifestCid) {
        console.warn("Missing cipherUrl or manifestCid for:", file.fileName);
        return;
      }

      // 1) fetch manifest JSON
      const mfResp = await fetch(
        manifestCid.startsWith("http")
          ? manifestCid
          : `https://gateway.pinata.cloud/ipfs/${manifestCid}`
      );
      if (!mfResp.ok) throw new Error("Failed to fetch manifest");
      const manifest = await mfResp.json();

      // 2) fetch ciphertext as Blob (binary!)
      const ctResp = await fetch(cipherUrl);
      if (!ctResp.ok) throw new Error("Failed to fetch ciphertext");
      const cipherBlob = await ctResp.blob();

      // 3) decrypt (parallel)
      const plainBlob = await decryptWithWalletKey(cipherBlob, signer, manifest, {
        concurrency: 8, // tune 8–12 based on CPU
      });

      // 4) ensure correct MIME for playback
      const mime = pickMime(file);
      const playBlob =
        mime && mime !== "application/octet-stream"
          ? new Blob([await plainBlob.arrayBuffer()], { type: mime })
          : plainBlob;

      const url = URL.createObjectURL(playBlob);
      setDecryptedUrls((prev) => ({ ...prev, [index]: url }));
    } catch (err) {
      console.error("Decrypt failed for", file.fileName, err);
      alert(`Decryption failed for ${file.fileName}`);
    } finally {
      setLoadingIndex(null);
    }
  };

  // Master decrypt all audios
  const handleDecryptAll = async () => {
    try {
      setMasterLoading(true);

      if (!window.ethereum) {
        alert("No wallet provider found. Please install MetaMask.");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();

      const newUrls = {};
      for (let i = 0; i < Audios.length; i++) {
        const file = Audios[i];

        try {
          const cipherUrl = pickCipherUrl(file);
          const manifestCid = pickManifestCid(file);
          if (!cipherUrl || !manifestCid) {
            console.warn("Missing fields for:", file.fileName);
            continue;
          }

          const mfResp = await fetch(
            manifestCid.startsWith("http")
              ? manifestCid
              : `https://gateway.pinata.cloud/ipfs/${manifestCid}`
          );
          if (!mfResp.ok) throw new Error("Failed to fetch manifest");
          const manifest = await mfResp.json();

          const ctResp = await fetch(cipherUrl);
          if (!ctResp.ok) throw new Error("Failed to fetch ciphertext");
          const cipherBlob = await ctResp.blob();

          const plainBlob = await decryptWithWalletKey(cipherBlob, signer, manifest, {
            concurrency: 8,
          });

          const mime = pickMime(file);
          const playBlob =
            mime && mime !== "application/octet-stream"
              ? new Blob([await plainBlob.arrayBuffer()], { type: mime })
              : plainBlob;

          newUrls[i] = URL.createObjectURL(playBlob);
        } catch (e) {
          console.error("Batch decrypt failed for", file.fileName, e);
        }
      }

      setDecryptedUrls(newUrls);
    } catch (err) {
      console.error("Decrypt all audios failed:", err);
      alert("Batch audio decryption failed.");
    } finally {
      setMasterLoading(false);
    }
  };

  return (
    <div className="content-page">
      <div className="container-fluid">
        {Audios.length === 0 ? (
          <Error />
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4>Audio Files</h4>
              <button
                onClick={handleDecryptAll}
                disabled={masterLoading}
                className="btn btn-success"
              >
                {masterLoading ? "Decrypting All..." : "Decrypt All Audios"}
              </button>
            </div>

            <div className="row">
              {Audios.map((file, index) => (
                <div key={index} className="col-lg-4 col-md-6">
                  <div className="card card-block card-stretch card-height">
                    <div className="card-body text-center">
                      {decryptedUrls[index] ? (
                        <audio controls className="w-100">
                          <source
                            src={decryptedUrls[index]}
                            type={pickMime(file)}
                          />
                        </audio>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              const provider = new ethers.providers.Web3Provider(window.ethereum);
                              await provider.send("eth_requestAccounts", []);
                              const signer = provider.getSigner();
                              await handleDecrypt(file, index, signer);
                            } catch (e) {
                              console.error(e);
                            }
                          }}
                          disabled={loadingIndex === index}
                          className="btn btn-primary"
                        >
                          {loadingIndex === index ? "Decrypting..." : "Decrypt & Listen"}
                        </button>
                      )}
                      <div className="new_card_flex mt-2">
                        <h6>{(file.fileName || "").slice(0, 18)}..</h6>
                        <span
                          onClick={() =>
                            navigator.clipboard.writeText(
                              pickCipherUrl(file) || ""
                            )
                          }
                          style={{ cursor: "pointer" }}
                          title="Copy CID/URL"
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

export default MyAudio;

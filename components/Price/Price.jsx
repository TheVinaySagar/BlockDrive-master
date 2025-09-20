import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCoins } from "react-icons/fa";
import { TiTick } from "react-icons/ti";


const Price = ({ memberships, BUY_CRADIT }) => {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("currentUser"));
      if (stored?.credit != null) setCredits(stored.credit);
    } catch {}
  }, []);

  // Fixed plans per your request
  const plans = [
    { plan: "Genesis",   price: "0.1", cradit: 20 },
    { plan: "Validator", price: "0.2", cradit: 50 },
    { plan: "Oracle",    price: "0.5", cradit: 150 },
  ];

  // Neon gradients per tier
  const gradients = [
    "linear-gradient(135deg,#00C6FF 0%,#0072FF 100%)", // Genesis
    "linear-gradient(135deg,#6A11CB 0%,#2575FC 100%)", // Validator
    "linear-gradient(135deg,#FF6A00 0%,#EE0979 100%)", // Oracle
  ];

  // Benefits (Genesis does NOT include marketplace visibility)
  const benefitsFor = (idx, cr) => {
    if (idx === 0) {
      return [
        "Private wallet-based encryption",
        "IPFS storage + fast retrieval",
        "Community support",
        `Includes ${cr} credits`,
        '10GB Storage',
      ];
    }
    if (idx === 1) {
      return [
        "Private wallet-based encryption",
        "IPFS storage + fast retrieval",
        "Marketplace visibility (public files)",
        "Priority support",
        `Includes ${cr} credits`,
        '25GB Storage',
      ];
    }
    return [
      "Private wallet-based encryption",
      "IPFS storage + fast retrieval",
      "Marketplace visibility (public files)",
      "Priority support + early features",
      `Includes ${cr} credits`,
      '100GB Storage',
    ];
  };

  return (
    <div className="content-page">
      <div className="container-fluid">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="d-flex align-items-center justify-content-between mb-4"
        >
          <h3
            className="mb-0"
            style={{
              fontWeight: 800,
              background: "linear-gradient(90deg,#00f2fe,#4facfe)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Choose Your STOrLEDGER Plan
          </h3>

          <span
            className="badge"
            style={{
              background:
                "linear-gradient(90deg, rgba(15,23,42,0.85), rgba(30,41,59,0.85))",
              color: "#a7f3d0",
              border: "1px solid rgba(45,212,191,0.35)",
              padding: "8px 12px",
              borderRadius: 10,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            title="Your current credit balance"
          >
            <FaCoins /> Credits: {credits}
          </span>
        </motion.div>

        {/* Plans */}
        <div className="row">
          {plans.map((p, i) => {
            const benefits = benefitsFor(i, p.cradit);
            return (
              <motion.div
                key={p.plan}
                className="col-lg-4 col-sm-6 mb-4"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <div
                  className="card card-block card-stretch card-height text-center"
                  style={{
                    borderRadius: 18,
                    overflow: "hidden",
                    background: "rgba(17, 24, 39, 0.85)", // dark glass
                    color: "white",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "0 12px 38px rgba(0,0,0,0.35)",
                  }}
                >
                  {/* Top gradient header with price */}
                  <div
                    style={{
                      background: gradients[i],
                      padding: "24px 14px",
                      borderBottom: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <FaCoins size={32} color="#fff" />
                    <h2 className="mb-0 mt-2" style={{ fontWeight: 800 }}>
                      {p.price} AVAX
                    </h2>
                    <div style={{ opacity: 0.9 }}>{p.plan}</div>
                  </div>

                  {/* Body */}
                  <div className="card-body">
                    <h4 className="mb-3" style={{ fontWeight: 700 }}>
                      {p.cradit} Credits
                    </h4>

                    <ul className="list-unstyled mb-4" style={{ textAlign: "left" }}>
                      {benefits.map((b, idx) => (
                        <li
                          key={idx}
                          className="mb-2"
                          style={{ display: "flex", alignItems: "center", gap: 8 }}
                        >
                          <TiTick color="#34d399" size={22} />
                          <span style={{ opacity: 0.95 }}>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <motion.button
                      onClick={() => BUY_CRADIT(p)}
                      className="btn btn-lg w-100"
                      whileHover={{ scale: 1.04 }}
                      style={{
                        borderRadius: 10,
                        fontWeight: 700,
                        background: gradients[i],
                        border: "none",
                        color: "white",
                        padding: "12px",
                        cursor: "pointer",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                      }}
                    >
                      Get {p.plan}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Friendly note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="alert mt-3 text-center"
          style={{
            background: "rgba(2,6,23,0.6)",
            color: "#e5e7eb",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
          }}
        >
          Credits power uploads and actions in StorLedger. You’ll need a small amount of AVAX for gas.
        </motion.div>

        {/* (Optional) local shimmer CSS if you later add loader skeletons */}
        <style jsx>{`
          .skeleton-loader {
            width: 100%;
            border-radius: 14px;
            background: linear-gradient(
              90deg,
              rgba(255,255,255,0.06) 25%,
              rgba(255,255,255,0.12) 37%,
              rgba(255,255,255,0.06) 63%
            );
            background-size: 400% 100%;
            animation: shimmer 1.4s ease-in-out infinite;
            height: 200px;
          }
          @keyframes shimmer {
            0% { background-position: 100% 0; }
            100% { background-position: 0 0; }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Price;

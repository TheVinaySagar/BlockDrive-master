import React, { useState } from "react";
import { IoMdSend, IoMdHelpCircle } from "react-icons/io";

/**
 * StorLedger Assistant — English, step-by-step FAQs
 * - Fuzzy keyword matching
 * - Renders steps as a numbered list
 * - Fallback: "No context found" with support email
 */

// ---------------- Knowledge Base ----------------
const KB = [
  // Overview
  {
    title: "What is StorLedger?",
    triggers: [
      "what is storledger",
      "about storledger",
      "what is this drive",
      "decentralized drive",
      "web3 drive",
    ],
    answer:
      "StorLedger is a simple, secure Web3 drive. You upload your files, they are locked privately, and stored on IPFS. Only you can open them with your wallet.",
  },
  {
    title: "How does it work (simple)?",
    triggers: ["how does it work", "working", "explain work", "how it works"],
    steps: [
      "Connect your wallet.",
      "Choose a file.",
      "The app privately locks (encrypts) the file in your browser.",
      "The locked file is stored on IPFS.",
      "Later, the same wallet unlocks the file inside the app.",
    ],
  },

  // Account & Login
  {
    title: "Create account",
    triggers: ["create account", "how to create account", "sign up", "register", "signup"],
    steps: [
      "Open the app and click **Sign Up**.",
      "Connect your wallet (MetaMask).",
      "Fill your name, username, and email.",
      "Confirm. Your on-chain profile is created.",
    ],
  },
  {
    title: "Login",
    triggers: ["how to login", "login", "sign in"],
    steps: [
      "Click **Login**.",
      "Connect the **same wallet** you used during Sign Up.",
      "Enter username and password.",
      "You’re in. Your files will load automatically.",
    ],
  },
  {
    title: "Reset password",
    triggers: ["reset password", "forgot password", "change password"],
    steps: [
      "Open **Reset Password**.",
      "Connect your wallet.",
      "Set a new password.",
      "Confirm. Your password is updated.",
    ],
  },

  // Wallet & AVAX
  {
    title: "Setup MetaMask (install & connect)",
    triggers: ["how to setup wallet", "metamask setup", "install metamask", "create wallet", "connect wallet"],
    steps: [
      "Install **MetaMask** (Chrome/Brave/Edge extension or mobile app).",
      "Create a new wallet and **securely back up** your secret recovery phrase.",
      "Open StorLedger and click **Connect Wallet** to link MetaMask.",
    ],
  },
  {
    title: "Create a MetaMask account (full process)",
    triggers: [
      "create metamask account",
      "metamask account create",
      "how to create metamask",
      "make metamask",
      "metamask new account",
    ],
    steps: [
      "Go to **metamask.io** and install the browser extension or mobile app.",
      "Click **Create a new wallet**.",
      "Set a strong password for the MetaMask app.",
      "MetaMask will show a **Secret Recovery Phrase (12/24 words)**.",
      "Write the phrase on paper and store it **offline**. Do not share it with anyone.",
      "Confirm the phrase inside MetaMask to finish setup.",
      "Open StorLedger and click **Connect Wallet**.",
      "Approve the connection in MetaMask. Your wallet is now ready to use.",
    ],
  },
  {
    title: "Add Avalanche (AVAX) network",
    triggers: ["setup avax rpc", "add avax network", "avalanche network", "avax rpc", "metamask avax"],
    steps: [
      "MetaMask → **Settings** → **Networks** → **Add Network**.",
      "Network Name: **Avalanche C-Chain**",
      "RPC URL: **https://api.avax.network/ext/bc/C/rpc**",
      "Chain ID: **43114**",
      "Symbol: **AVAX**",
      "Block Explorer: **https://snowtrace.io/**",
    ],
  },
  {
    title: "Where to get AVAX?",
    triggers: ["where to get avax", "buy avax", "how to get avax"],
    steps: [
      "Buy AVAX on an exchange (Binance, Coinbase, etc.).",
      "Withdraw to your MetaMask on **Avalanche C-Chain**.",
      "Keep a small amount of AVAX for transactions (gas).",
    ],
  },

  // Uploading (simple language)
  {
    title: "How to upload a file (any type)",
    triggers: ["how to upload file", "file upload", "upload steps", "upload"],
    steps: [
      "Go to the **Upload** section.",
      "Drag & drop a file or click **Browse** to choose one.",
      "Fill **title**, **description**, **category**, **visibility**.",
      "The file is **locked privately** and stored on **IPFS**.",
      "Approve the wallet **transaction** if asked.",
      "All set! Check your file in **My Drive / D-Storage**.",
    ],
  },
  {
    title: "Upload image / audio / pdf / video",
    triggers: ["upload image", "upload audio", "upload pdf", "upload video", "photo upload"],
    steps: [
      "Open **Upload** and choose your file.",
      "Pick the correct **category** (Image / Audio / PDF / Video).",
      "The file is saved privately on IPFS.",
      "After the transaction (if any), find it in **My Drive**.",
    ],
  },

  // Decryption / Open
  {
    title: "Open or decrypt my file",
    triggers: ["how to decrypt file", "decrypt file", "open file", "view file"],
    steps: [
      "Go to **My Drive**.",
      "Click **Decrypt / Open** on the file.",
      "If your wallet is connected, the file opens inside the app.",
    ],
  },

  // Credits & Rights
  {
    title: "What are credits?",
    triggers: ["what are credits", "credits info", "credits information"],
    answer:
      "Credits let you upload and perform certain actions. If you run low, buy a plan to top up your credits.",
  },
  {
    title: "How to buy credits",
    triggers: ["how to buy credits", "buy credits", "purchase credits", "get credits"],
    steps: [
      "Open **Buy Credits** (Price).",
      "Choose a plan: **Basic / Silver / Gold**.",
      "Approve the wallet transaction.",
      "Credits are added instantly.",
    ],
  },
  {
    title: "File rights / certificates",
    triggers: ["what is file right", "buy right", "certificate", "access rights"],
    answer:
      "A file right is on-chain permission. You can buy a right for public files to use them. Everything is recorded on the blockchain.",
  },

  // Safety
  {
    title: "Is my data safe?",
    triggers: ["is my data safe", "privacy", "security", "private"],
    answer:
      "Yes. Your file is locked privately in your browser and stored on IPFS. Only your wallet can open it. We can’t see your files.",
  },
  {
    title: "If I lose my wallet",
    triggers: ["lost wallet", "wallet lost", "seed lost", "wallet recovery"],
    answer:
      "If you lose access to your wallet/seed phrase, you cannot open your files. Always back up your Secret Recovery Phrase securely.",
  },

  // Troubleshoot
  {
    title: "Decrypt not working",
    triggers: ["decrypt not working", "decryption failed", "cannot decrypt", "error decrypt"],
    steps: [
      "Connect the **same wallet** you used to upload.",
      "Wait a moment — files load from IPFS.",
      "Approve any required transaction/permission.",
      "Refresh and try again if needed.",
    ],
  },
];

// ---------------- Fuzzy Matching ----------------
function normalize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
function scoreMatch(userText, kbEntry) {
  const q = normalize(userText);
  const qTokens = new Set(q.split(" "));
  let best = 0;
  for (const trig of kbEntry.triggers) {
    const tTokens = normalize(trig).split(" ");
    let score = 0;
    for (const tok of tTokens) if (qTokens.has(tok)) score++;
    if (score > best) best = score;
  }
  return best;
}
function searchKB(userText) {
  const results = KB
    .map((entry) => ({ entry, score: scoreMatch(userText, entry) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  return results.length ? results[0].entry : null;
}

// Quick suggests
const SUGGESTS = [
  "how to create account",
  "create metamask account",
  "setup avax rpc",
  "how to upload file",
  "how to decrypt file",
  "how to buy credits",
];

// ---------------- Chatbot UI ----------------
const Chatbot = () => {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text:
        "Hi 👋 I’m the StorLedger Assistant. Ask me about: creating accounts, MetaMask, AVAX setup, upload/decrypt, credits, etc.",
    },
  ]);

  const send = () => {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: "user", text: q }]);

    const hit = searchKB(q);
    if (hit) {
      const header = `🧩 ${hit.title}`;
      if (hit.steps?.length) {
        const body = hit.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
        setMessages((m) => [...m, { from: "bot", text: `${header}\n${body}` }]);
      } else {
        setMessages((m) => [...m, { from: "bot", text: `${header}\n${hit.answer}` }]);
      }
    } else {
      setMessages((m) => [
        ...m,
        {
          from: "bot",
          text:
            "No context found. Please contact support: sachinkardam5581@gmail.com",
        },
      ]);
    }
    setInput("");
  };

  const clickSuggest = (q) => {
    setInput(q);
    setTimeout(send, 0);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          zIndex: 10000,
          borderRadius: 999,
          background: "#0d6efd",
          color: "white",
          border: "none",
          padding: "12px 14px",
          boxShadow: "0 8px 20px rgba(13,110,253,0.3)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          cursor: "pointer",
        }}
        title="StorLedger Assistant"
      >
        <IoMdHelpCircle size={20} />
        Blockbot
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        width: 340,
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 10000,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          background: "#0d6efd",
          color: "white",
          padding: "10px 12px",
          fontWeight: 700,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Nakamoto</span>
        <button
          onClick={() => setOpen(false)}
          style={{
            background: "transparent",
            border: "none",
            color: "white",
            fontSize: 18,
            cursor: "pointer",
          }}
          title="Hide"
        >
          ×
        </button>
      </div>

      {/* Suggest chips */}
      <div
        style={{
          padding: "8px 10px",
          borderBottom: "1px solid #f1f5f9",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {SUGGESTS.map((s, i) => (
          <button
            key={i}
            onClick={() => clickSuggest(s)}
            style={{
              background: "#f1f5f9",
              border: "1px solid #e5e7eb",
              borderRadius: 999,
              padding: "6px 10px",
              fontSize: 12,
              cursor: "pointer",
            }}
            title={s}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: 10, overflowY: "auto", maxHeight: 320 }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.from === "user" ? "right" : "left",
              margin: "6px 0",
              whiteSpace: "pre-wrap",
            }}
          >
            <span
              style={{
                background: m.from === "user" ? "#0d6efd" : "#f8fafc",
                color: m.from === "user" ? "white" : "#0f172a",
                padding: "7px 10px",
                borderRadius: 10,
                display: "inline-block",
                lineHeight: 1.35,
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", borderTop: "1px solid #f1f5f9" }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about account, MetaMask, AVAX, upload, decrypt, credits…"
          style={{ flex: 1, border: "none", padding: 12, outline: "none" }}
        />
        <button
          onClick={send}
          style={{
            background: "transparent",
            border: "none",
            padding: 10,
            cursor: "pointer",
            color: "#0d6efd",
          }}
          title="Send"
        >
          <IoMdSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;

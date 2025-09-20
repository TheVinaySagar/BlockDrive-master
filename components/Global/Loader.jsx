import React from "react";

/**
 * StorLedger / Blockchain Loader
 * - No external libraries
 * - Works in dark & light
 * - Animations respect prefers-reduced-motion
 */
const Loader = () => {
  return (
    <div className="sl-loader-wrap">
      {/* Orbiting blocks */}
      <div className="orbit orbit-1">
        <span className="block b1" />
        <span className="block b2" />
        <span className="block b3" />
      </div>
      <div className="orbit orbit-2">
        <span className="block b1" />
        <span className="block b2" />
        <span className="block b3" />
      </div>

      {/* Spinning BTC coin */}
      <div className="coin">
        <div className="coin-face">
          <svg
            viewBox="0 0 120 120"
            width="120"
            height="120"
            aria-label="Loading"
            role="img"
          >
            {/* Outer glow ring */}
            <defs>
              <radialGradient id="g" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="rgba(255, 183, 77, 1)" />
                <stop offset="60%" stopColor="rgba(255, 153, 0, 1)" />
                <stop offset="100%" stopColor="rgba(255, 153, 0, 0.35)" />
              </radialGradient>
            </defs>

            <circle cx="60" cy="60" r="46" fill="url(#g)" />
            <circle
              cx="60"
              cy="60"
              r="46"
              fill="none"
              stroke="rgba(255, 200, 66, 0.65)"
              strokeWidth="4"
            />

            {/* Bitcoin “B” */}
            <g transform="translate(60 60)">
              <path
                d="M-10 -20 h12 a10 10 0 1 1 0 20 a10 10 0 1 1 0 20 h-12 z"
                fill="#1b1b1b"
                opacity="0.18"
              />
              <path
                d="M-8 -22 h10 a9 9 0 1 1 0 18 h-10 z M-8 -4 h12 a9 9 0 1 1 0 18 h-12 z"
                fill="#fff"
              />
              <rect x="-12" y="-28" width="7" height="6" rx="1.5" fill="#fff" />
              <rect x="-12" y="22" width="7" height="6" rx="1.5" fill="#fff" />
            </g>
          </svg>
        </div>
      </div>

      {/* text */}
      <div className="hint">Securing your data on-chain…</div>

      <style jsx>{`
        .sl-loader-wrap {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 200px;
          padding: 16px;
          isolation: isolate;
        }

        /* coin */
        .coin {
          width: 140px;
          height: 140px;
          border-radius: 999px;
          background: radial-gradient(
              60% 60% at 50% 40%,
              rgba(255, 210, 100, 0.55) 0%,
              rgba(255, 170, 54, 0.35) 40%,
              rgba(255, 153, 0, 0.2) 60%,
              transparent 80%
            ),
            linear-gradient(135deg, #ffb74d 0%, #ff9800 60%, #ffb74d 100%);
          box-shadow: 0 0 32px rgba(255, 166, 0, 0.55), inset 0 0 16px rgba(0, 0, 0, 0.25);
          display: grid;
          place-items: center;
          animation: spin 2.4s linear infinite;
        }

        .coin-face {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: radial-gradient(
            circle at 50% 35%,
            rgba(255, 255, 255, 0.16),
            rgba(0, 0, 0, 0) 50%
          );
          display: grid;
          place-items: center;
          filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35));
        }

        /* orbits */
        .orbit {
          position: absolute;
          border-radius: 9999px;
          inset: 0;
          display: grid;
          place-items: center;
          pointer-events: none;
          opacity: 0.85;
        }
        .orbit-1 {
          animation: orbitSpin 5.5s linear infinite;
        }
        .orbit-2 {
          transform: scale(1.35);
          animation: orbitSpinReverse 7s linear infinite;
          opacity: 0.6;
        }

        .block {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 3px;
          background: linear-gradient(145deg, #00e5ff, #2979ff);
          box-shadow: 0 0 12px rgba(0, 229, 255, 0.6);
          transform: translate(-70px, 0) rotate(0deg);
        }
        .orbit-1 .b1 {
          transform: rotate(0deg) translateX(95px);
        }
        .orbit-1 .b2 {
          transform: rotate(120deg) translateX(95px);
        }
        .orbit-1 .b3 {
          transform: rotate(240deg) translateX(95px);
        }

        .orbit-2 .b1 {
          transform: rotate(60deg) translateX(130px);
          background: linear-gradient(145deg, #00ffa3, #00e676);
          box-shadow: 0 0 12px rgba(0, 255, 163, 0.6);
        }
        .orbit-2 .b2 {
          transform: rotate(180deg) translateX(130px);
          background: linear-gradient(145deg, #b388ff, #7c4dff);
          box-shadow: 0 0 12px rgba(124, 77, 255, 0.6);
        }
        .orbit-2 .b3 {
          transform: rotate(300deg) translateX(130px);
          background: linear-gradient(145deg, #ff6e6e, #ff3d00);
          box-shadow: 0 0 12px rgba(255, 61, 0, 0.55);
        }

        .hint {
          margin-top: 14px;
          font-size: 0.95rem;
          letter-spacing: 0.2px;
          color: rgba(0, 0, 0, 0.6);
        }
        :global(.dark) .hint,
        :global([data-theme="dark"]) .hint {
          color: rgba(255, 255, 255, 0.75);
        }

        /* animations */
        @keyframes spin {
          to {
            transform: rotate(1turn);
          }
        }
        @keyframes orbitSpin {
          to {
            transform: rotate(1turn);
          }
        }
        @keyframes orbitSpinReverse {
          to {
            transform: rotate(-1turn) scale(1.35);
          }
        }

        /* accessibility: reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .coin,
          .orbit-1,
          .orbit-2 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;

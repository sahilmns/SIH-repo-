import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateAccount = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "inspector",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateAccount = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill all the fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const user = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };

    localStorage.setItem(
      "labellens_registered_user",
      JSON.stringify(user)
    );

    alert("Account created successfully!");

    navigate("/login");
  };

  return (
    <div className="create-account-page">

      {/* =====================================================
          BACKGROUND DECORATION
      ====================================================== */}

      <div className="chakra"></div>

      <div className="wave wave-one"></div>
      <div className="wave wave-two"></div>
      <div className="wave wave-three"></div>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="create-account-content">

        {/* =================================================
            GOVERNMENT LOGO
        ================================================== */}

        <div className="ministry-section">
          <img
            src="/ministry.png"
            alt="Department of Consumer Affairs"
            className="ministry-logo"
          />
        </div>


        {/* =================================================
            NIYAMDRISHTI BRANDING
        ================================================== */}

        <div className="brand-section">

          <img
            src="/images/nw.png"
            alt="NiyamDrishti"
            className="brand-logo"
          />

          <p className="tagline">
            See The Label Know The Truth
          </p>

        </div>


        {/* =================================================
            CREATE ACCOUNT CARD
        ================================================== */}

        <div className="create-account-card">

          {/* Heading */}

          <div className="card-heading">

            <h2>
              Create Your Account
            </h2>

            <p>
              Create an account to access the Legal Metrology Compliance Portal
            </p>

          </div>


          {/* =================================================
              FORM
          ================================================== */}

          <form onSubmit={handleCreateAccount}>

            {/* ================= FULL NAME ================= */}

            <div className="form-group">

              <label htmlFor="name">
                Full Name
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6.75a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 20.25a8.25 8.25 0 0115 0"
                    />
                  </svg>
                </span>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                />

              </div>

            </div>


            {/* ================= EMAIL ================= */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 7.5l9 6 9-6"
                    />
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                  </svg>
                </span>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  autoComplete="email"
                />

              </div>

            </div>


            {/* ================= ACCOUNT TYPE ================= */}

            <div className="form-group">

              <label htmlFor="role">
                Account Type
              </label>

              <div className="select-wrapper">

                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >

                  <option value="inspector">
                    Inspector
                  </option>

                  <option value="consumer">
                    Consumer
                  </option>

                  <option value="manufacturer">
                    Manufacturer
                  </option>

                </select>

                <span className="select-arrow">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 9l6 6 6-6"
                    />
                  </svg>
                </span>

              </div>

            </div>


            {/* ================= PASSWORD ================= */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10V7a4 4 0 018 0v3"
                    />
                  </svg>
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.58 10.58a2 2 0 002.84 2.84"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.88 4.24A10.45 10.45 0 0112 4c5 0 8.27 4.5 9 6a13.7 13.7 0 01-3.07 3.87"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.61 6.61C4.5 7.93 3.24 9.75 3 10c.73 1.5 4 6 9 6 1.07 0 2.06-.21 2.94-.58"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6z"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />
                    </svg>
                  )}
                </button>

              </div>

            </div>


            {/* ================= CONFIRM PASSWORD ================= */}

            <div className="form-group">

              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="input-wrapper">

                <span className="input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    aria-hidden="true"
                  >
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="10"
                      rx="2"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 10V7a4 4 0 018 0v3"
                    />
                  </svg>
                </span>

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l18 18"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.58 10.58a2 2 0 002.84 2.84"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.88 4.24A10.45 10.45 0 0112 4c5 0 8.27 4.5 9 6a13.7 13.7 0 01-3.07 3.87"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.61 6.61C4.5 7.93 3.24 9.75 3 10c.73 1.5 4 6 9 6 1.07 0 2.06-.21 2.94-.58"
                      />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6-9.75-6-9.75-6z"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="2.5"
                      />
                    </svg>
                  )}
                </button>

              </div>

            </div>


            {/* ================= CREATE ACCOUNT BUTTON ================= */}

            <button
              type="submit"
              className="create-account-button"
            >
              Create Account
            </button>

          </form>


          {/* =================================================
              LOGIN LINK
          ================================================== */}

          <div className="login-link-section">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

          </div>

        </div>


        {/* =================================================
            BACK TO HOME
        ================================================== */}

        <div className="back-home">

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>

        </div>

      </div>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="create-account-footer">

        <div>
          © 2026 Department of Consumer Affairs, Government of India
        </div>

        <div className="footer-links">
          <span>Privacy Policy</span>
          <span>|</span>
          <span>Terms of Use</span>
          <span>|</span>
          <span>Help</span>
        </div>

      </footer>


      {/* =====================================================
          PAGE STYLES
      ====================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .create-account-page {
          min-height: 100vh;
          background: #f8fafc;
          color: #081D41;
          font-family: "Segoe UI", Arial, Helvetica, sans-serif;
          position: relative;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
        }

        /* =================================================
           BACKGROUND WAVES
        ================================================== */

        .wave {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }

        .wave-one {
          width: 760px;
          height: 320px;
          left: -210px;
          top: -165px;
          background: rgba(215, 226, 239, 0.35);
          border-radius: 50%;
          transform: rotate(-12deg);
        }

        .wave-two {
          width: 900px;
          height: 300px;
          right: -340px;
          bottom: -130px;
          background: rgba(215, 226, 239, 0.25);
          border-radius: 50%;
          transform: rotate(-8deg);
        }

        .wave-three {
          width: 580px;
          height: 180px;
          left: -170px;
          bottom: -95px;
          background: rgba(226, 234, 243, 0.25);
          border-radius: 50%;
          transform: rotate(10deg);
        }


        /* =================================================
           ASHOKA CHAKRA WATERMARK
        ================================================== */

        .chakra {
          position: absolute;
          width: 420px;
          height: 420px;
          right: -155px;
          top: 340px;
          border: 14px solid rgba(193, 211, 230, 0.25);
          border-radius: 50%;
          opacity: 0.7;
          pointer-events: none;
          z-index: 0;
          background:
            conic-gradient(
              from 0deg,
              transparent 0deg 7deg,
              rgba(193, 211, 230, 0.18) 7deg 9deg,
              transparent 9deg 22.5deg
            );
          background-size: 100% 100%;
        }

        .chakra::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid rgba(193, 211, 230, 0.22);
          border-radius: 50%;
          inset: 0;
        }

        .chakra::after {
          content: "";
          position: absolute;
          width: 70px;
          height: 70px;
          border: 7px solid rgba(193, 211, 230, 0.22);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }


        /* =================================================
           MAIN CONTENT
        ================================================== */

        .create-account-content {
          width: 100%;
          max-width: 760px;
          margin: 0 auto;
          padding: 30px 16px 38px;
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
        }


        /* =================================================
           MINISTRY LOGO
        ================================================== */

        .ministry-section {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .ministry-logo {
          width: 330px;
          max-width: 65vw;
          height: auto;
          object-fit: contain;
        }


        /* =================================================
           BRANDING
        ================================================== */

        .brand-section {
          text-align: center;
          margin-top: 4px;
          margin-bottom: 22px;
        }

        .brand-logo {
          width: 380px;
          max-width: 78vw;
          height: auto;
          object-fit: contain;
          display: block;
          margin: 0 auto;
        }

        .tagline {
          margin: 5px 0 0;
          font-size: 17px;
          color: #52647e;
          letter-spacing: 0.2px;
        }


        /* =================================================
           CARD
        ================================================== */

        .create-account-card {
          width: 500px;
          max-width: calc(100vw - 32px);
          background: rgba(255, 255, 255, 0.97);
          border: 1px solid #d2dce8;
          border-radius: 6px;
          padding: 30px 32px 28px;
          box-shadow: 0 5px 20px rgba(8, 29, 65, 0.09);
        }


        /* =================================================
           CARD HEADING
        ================================================== */

        .card-heading {
          text-align: center;
          margin-bottom: 25px;
        }

        .card-heading h2 {
          margin: 0;
          font-size: 25px;
          line-height: 1.3;
          font-weight: 650;
          color: #081D41;
        }

        .card-heading p {
          margin: 7px 0 0;
          font-size: 14px;
          line-height: 1.5;
          color: #60718a;
        }


        /* =================================================
           FORM
        ================================================== */

        .form-group {
          margin-bottom: 18px;
        }

        .form-group label {
          display: block;
          margin-bottom: 7px;
          font-size: 14px;
          line-height: 1.3;
          font-weight: 600;
          color: #081D41;
        }


        /* =================================================
           INPUTS
        ================================================== */

        .input-wrapper,
        .select-wrapper {
          position: relative;
          width: 100%;
        }

        .input-wrapper input,
        .select-wrapper select {
          width: 100%;
          height: 47px;
          border: 1px solid #c8d3e1;
          border-radius: 5px;
          background: #ffffff;
          color: #081D41;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .input-wrapper input {
          padding: 0 43px 0 43px;
        }

        .select-wrapper select {
          padding: 0 42px 0 43px;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
        }

        .input-wrapper input::placeholder {
          color: #8a98aa;
        }

        .input-wrapper input:focus,
        .select-wrapper select:focus {
          border-color: #0070FF;
          box-shadow: 0 0 0 3px rgba(0, 112, 255, 0.08);
        }


        /* =================================================
           INPUT ICON
        ================================================== */

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          width: 18px;
          height: 18px;
          transform: translateY(-50%);
          color: #60718a;
          pointer-events: none;
          z-index: 1;
        }

        .input-icon svg {
          width: 18px;
          height: 18px;
          display: block;
        }


        /* =================================================
           PASSWORD TOGGLE
        ================================================== */

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 30px;
          height: 30px;
          border: none;
          background: transparent;
          color: #60718a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .password-toggle:hover {
          color: #0070FF;
        }

        .password-toggle svg {
          width: 18px;
          height: 18px;
        }


        /* =================================================
           SELECT ARROW
        ================================================== */

        .select-arrow {
          position: absolute;
          right: 13px;
          top: 50%;
          width: 18px;
          height: 18px;
          transform: translateY(-50%);
          color: #60718a;
          pointer-events: none;
        }

        .select-arrow svg {
          width: 18px;
          height: 18px;
          display: block;
        }


        /* =================================================
           CREATE ACCOUNT BUTTON
        ================================================== */

        .create-account-button {
          width: 100%;
          height: 48px;
          margin-top: 3px;
          border: none;
          border-radius: 5px;
          background: #081D41;
          color: #ffffff;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.18s ease,
            transform 0.12s ease;
        }

        .create-account-button:hover {
          background: #102b59;
        }

        .create-account-button:active {
          transform: translateY(1px);
        }


        /* =================================================
           LOGIN LINK
        ================================================== */

        .login-link-section {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 4px;
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid #e3e9f0;
          font-size: 14px;
          color: #60718a;
        }

        .login-link-section button {
          border: none;
          padding: 0;
          background: transparent;
          color: #0070FF;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .login-link-section button:hover {
          text-decoration: underline;
        }


        /* =================================================
           BACK TO HOME
        ================================================== */

        .back-home {
          margin-top: 17px;
          text-align: center;
        }

        .back-home button {
          border: none;
          background: transparent;
          color: #60718a;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
          transition: color 0.18s ease;
        }

        .back-home button:hover {
          color: #081D41;
        }


        /* =================================================
           FOOTER
        ================================================== */

        .create-account-footer {
          min-height: 72px;
          width: 100%;
          background: #081D41;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
          padding: 16px 20px;
          font-size: 12px;
          position: relative;
          z-index: 2;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dbe5f2;
        }


        /* =================================================
           TABLET
        ================================================== */

        @media (max-width: 768px) {

          .create-account-content {
            padding-top: 24px;
          }

          .ministry-logo {
            width: 280px;
          }

          .brand-logo {
            width: 330px;
          }

          .brand-section {
            margin-bottom: 18px;
          }

          .create-account-card {
            padding: 28px 25px 26px;
          }

          .chakra {
            width: 340px;
            height: 340px;
            right: -180px;
            top: 400px;
          }

        }


        /* =================================================
           MOBILE
        ================================================== */

        @media (max-width: 520px) {

          .create-account-content {
            padding: 20px 12px 30px;
          }

          .ministry-logo {
            width: 245px;
            max-width: 82vw;
          }

          .brand-logo {
            width: 300px;
            max-width: 88vw;
          }

          .tagline {
            font-size: 15px;
          }

          .create-account-card {
            width: 100%;
            max-width: calc(100vw - 24px);
            padding: 25px 20px 24px;
          }

          .card-heading {
            margin-bottom: 22px;
          }

          .card-heading h2 {
            font-size: 22px;
          }

          .card-heading p {
            font-size: 13px;
          }

          .form-group {
            margin-bottom: 17px;
          }

          .create-account-footer {
            flex-direction: column;
            gap: 8px;
            text-align: center;
          }

          .footer-links {
            flex-wrap: wrap;
            justify-content: center;
          }

          .chakra {
            width: 280px;
            height: 280px;
            right: -165px;
            top: 440px;
          }

          .wave-one {
            width: 550px;
            left: -250px;
          }

          .wave-two {
            width: 650px;
            right: -340px;
          }

        }

      `}</style>

    </div>
  );
};

export default CreateAccount;

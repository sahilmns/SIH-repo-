import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("inspector");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    login({
      email: email,
      role: role,
    });

    if (role === "consumer") {
      navigate("/consumer-dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="login-page">

      {/*  BACKGROUND DECORATION  */}

      <div className="chakra"></div>

      <div className="wave wave-one"></div>
      <div className="wave wave-two"></div>
      <div className="wave wave-three"></div>


      {/*  MAIN CONTENT  */}

      <div className="login-content">

        {/* Government Logo */}
        <div className="government-section">

          <img
            src="/ministry.png"
            alt="Department of Consumer Affairs"
            className="ministry-logo"
          />

        </div>


        {/* LabelLens Branding */}
        <div className="brand-section">

          <h1 className="brand-name">
            <span className="label">Niyam</span>
            <span className="lens">Drishti</span>
          </h1>

          <p className="tagline">
            See The Label Know The Truth 
          </p>

        </div>


        {/*  LOGIN CARD  */}

        <div className="login-card">

          <div className="login-heading">

            <h2>Login to Your Account</h2>

            <p>
              Access the Legal Metrology Compliance Portal
            </p>

          </div>


          <form onSubmit={handleLogin}>

            {/*  ROLE  */}

            <div className="form-group">

              <label htmlFor="role">
                Login As
              </label>

              <div className="input-box">

                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="role-select"
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

              </div>

            </div>


            {/*  EMAIL  */}

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <div className="input-box">

                <span className="input-icon">
                  ✉
                </span>

                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

              </div>

            </div>


            {/*  PASSWORD  */}

            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <div className="input-box">

                <span className="input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? "◉" : "○"}
                </button>

              </div>

            </div>


            {/*  LOGIN BUTTON  */}

            <button
              type="submit"
              className="login-button"
            >
              <span>Login</span>
              <span className="login-arrow">→</span>
            </button>


            {/*  DIVIDER  */}

            <div className="divider">

              <span></span>

              <p>OR</p>

              <span></span>

            </div>


            {/*  FORGOT PASSWORD  */}

            <button
              type="button"
              className="forgot-password"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </button>

          </form>

        </div>

      </div>


      {/*  FOOTER  */}

      <footer className="login-footer">

        <div className="footer-left">
          © 2026 Department of Consumer Affairs,
          Government of India
        </div>

        <div className="footer-right">

          <a href="#privacy">
            Privacy Policy
          </a>

          <span>|</span>

          <a href="#terms">
            Terms of Use
          </a>

          <span>|</span>

          <a href="#help">
            Help
          </a>

        </div>

      </footer>


      {/*  STYLES  */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          min-height: 100%;
          width: 100%;
        }

        body {
          font-family:
            "Segoe UI",
            Arial,
            Helvetica,
            sans-serif;
        }


        /* 
           PAGE */

        .login-page {
          min-height: 100vh;
          position: relative;
          overflow: hidden;

          background: #f8fafc;

          display: flex;
          flex-direction: column;

          color: #081D41;
        }


        /* =====================================================
           BACKGROUND WAVES
        ===================================================== */

        .wave {
          position: absolute;
          left: -10%;
          width: 120%;
          height: 230px;

          background: rgba(215, 226, 239, 0.35);

          border-radius: 50% 50% 0 0;

          transform: rotate(-4deg);

          pointer-events: none;
          z-index: 0;
        }

        .wave-one {
          bottom: 55px;
          opacity: 0.75;
        }

        .wave-two {
          bottom: -30px;
          opacity: 0.55;
          transform: rotate(3deg);
        }

        .wave-three {
          bottom: -110px;
          opacity: 0.35;
          transform: rotate(-2deg);
        }


        /* =====================================================
           ASHOKA CHAKRA WATERMARK
        ===================================================== */

        .chakra {
          position: absolute;

          width: 390px;
          height: 390px;

          right: -105px;
          top: 340px;

          border: 18px solid rgba(193, 211, 230, 0.25);

          border-radius: 50%;

          pointer-events: none;

          z-index: 0;
        }

        .chakra::before {
          content: "";

          position: absolute;

          width: 45px;
          height: 45px;

          left: 50%;
          top: 50%;

          transform: translate(-50%, -50%);

          border: 9px solid rgba(193, 211, 230, 0.25);

          border-radius: 50%;
        }

        .chakra::after {
          content: "";

          position: absolute;

          width: 320px;
          height: 320px;

          left: 50%;
          top: 50%;

          transform: translate(-50%, -50%);

          border-radius: 50%;

          background:
            repeating-conic-gradient(
              from 0deg,
              rgba(193, 211, 230, 0.23) 0deg,
              rgba(193, 211, 230, 0.23) 1.2deg,
              transparent 1.2deg,
              transparent 15deg
            );
        }


        /* =====================================================
           CONTENT
        ===================================================== */

        .login-content {
          position: relative;

          z-index: 2;

          width: 100%;

          flex: 1;

          display: flex;
          flex-direction: column;

          align-items: center;

          padding-top: 30px;
          padding-bottom: 38px;
        }


        /* =====================================================
           GOVERNMENT LOGO
        ===================================================== */

        .government-section {
          width: 100%;

          display: flex;
          justify-content: center;

          margin-bottom: 14px;
        }

        .ministry-logo {
          width: 330px;

          max-width: 65vw;

          height: auto;

          object-fit: contain;

          display: block;
        }


        /* =====================================================
           LABEL LENS
        ===================================================== */

        .brand-section {
          text-align: center;

          margin-bottom: 28px;
        }

        .brand-name {
          margin: 0;

          font-family:
            Georgia,
            "Times New Roman",
            serif;

          font-size: 48px;

          line-height: 1;

          font-weight: 700;

          letter-spacing: -1.5px;
        }

        .label {
          color: #081D41;
        }

        .lens {
          color: #0070FF;
        }

        .tagline {
          margin: 9px 0 0;

          font-size: 17px;

          color: #52647e;

          font-weight: 400;

          letter-spacing: 0.1px;
        }


        /* =====================================================
           LOGIN CARD
        ===================================================== */

        .login-card {
          width: 500px;

          max-width: calc(100% - 32px);

          background: rgba(255, 255, 255, 0.96);

          border: 1px solid #d2dce8;

          border-radius: 6px;

          padding: 33px 32px 34px;

          box-shadow:
            0 5px 20px rgba(8, 29, 65, 0.09);
        }


        /* =====================================================
           LOGIN HEADING
        ===================================================== */

        .login-heading {
          text-align: center;

          margin-bottom: 27px;
        }

        .login-heading h2 {
          margin: 0 0 8px;

          color: #081D41;

          font-size: 25px;

          line-height: 1.2;

          font-weight: 650;
        }

        .login-heading p {
          margin: 0;

          color: #60718a;

          font-size: 14px;
        }


        /* ==== FORM */

        .form-group {
          margin-bottom: 21px;
        }

        .form-group label {
          display: block;

          margin-bottom: 8px;

          color: #081D41;

          font-size: 14px;

          font-weight: 600;
        }


        /* ==== INPUT==== */

        .input-box {
          position: relative;

          width: 100%;

          display: flex;

          align-items: center;
        }

        .input-box input {
          width: 100%;

          height: 47px;

          border: 1px solid #c8d3e1;

          border-radius: 5px;

          background: #ffffff;

          padding:
            0 44px
            0 43px;

          outline: none;

          color: #081D41;

          font-size: 14px;

          font-family: inherit;

          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .input-box input::placeholder {
          color: #99a6b7;
        }

        .input-box input:focus {
          border-color: #0070FF;

          box-shadow:
            0 0 0 2px rgba(0, 112, 255, 0.10);
        }


        /* ==== ROLE SELECT==== */

        .role-select {
          width: 100%;

          height: 47px;

          border: 1px solid #c8d3e1;

          border-radius: 5px;

          background: #ffffff;

          padding: 0 14px;

          outline: none;

          color: #081D41;

          font-size: 14px;

          font-family: inherit;

          cursor: pointer;

          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .role-select:focus {
          border-color: #0070FF;

          box-shadow:
            0 0 0 2px rgba(0, 112, 255, 0.10);
        }


        .input-icon {
          position: absolute;

          left: 14px;

          color: #60718a;

          font-size: 17px;

          z-index: 2;

          pointer-events: none;
        }


        /* ==== PASSWORD BUTTON==== */

        .show-password {
          position: absolute;

          right: 11px;

          top: 50%;

          transform: translateY(-50%);

          border: none;

          background: transparent;

          color: #52647e;

          cursor: pointer;

          padding: 5px;

          font-size: 15px;
        }

        .show-password:hover {
          color: #0070FF;
        }


        /* ====LOGIN BUTTON==== */

        .login-button {
          width: 100%;

          height: 48px;

          margin-top: 3px;

          border: none;

          border-radius: 5px;

          background: #081D41;

          color: #ffffff;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 9px;

          font-family: inherit;

          font-size: 15px;

          font-weight: 600;

          cursor: pointer;

          transition:
            background 0.15s ease;
        }

        .login-button:hover {
          background: #102b59;
        }

        .login-arrow {
          font-size: 19px;

          line-height: 1;
        }


        /* == OR DIVIDER== */

        .divider {
          display: flex;

          align-items: center;

          gap: 15px;

          margin:
            25px 0 18px;
        }

        .divider span {
          flex: 1;

          height: 1px;

          background: #d7dfe9;
        }

        .divider p {
          margin: 0;

          color: #66758a;

          font-size: 12px;

          font-weight: 500;
        }


        /* == FORGOT PASSWORD== */

        .forgot-password {
          display: block;

          margin: auto;

          border: none;

          background: transparent;

          color: #0070FF;

          font-family: inherit;

          font-size: 14px;

          cursor: pointer;

          padding: 2px 5px;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }


        /* == FOOTER== */

        .login-footer {
          position: relative;

          z-index: 3;

          min-height: 72px;

          width: 100%;

          background: #081D41;

          color: #ffffff;

          display: flex;

          align-items: center;



          padding: 0 6%;
        }

        .footer-left {
          font-size: 12px;

          opacity: 0.95;
        }

        .footer-right {
          margin-left: auto;

          display: flex;

          align-items: center;

          gap: 13px;

          font-size: 12px;
        }

        .footer-right a {
          color: #ffffff;

          text-decoration: none;
        }

        .footer-right a:hover {
          text-decoration: underline;
        }


        /* == TABLET ==*/

        @media (max-width: 800px) {

          .login-content {
            padding-top: 24px;
          }

          .ministry-logo {
            width: 290px;
          }

          .brand-name {
            font-size: 44px;
          }

          .chakra {
            right: -180px;
            top: 430px;
          }

          .footer-left {
            max-width: 48%;
          }

        }


        /* == MOBILE== */

        @media (max-width: 600px) {

          .login-content {
            padding-top: 20px;

            padding-bottom: 30px;
          }

          .ministry-logo {
            width: 270px;

            max-width: 85vw;
          }

          .government-section {
            margin-bottom: 11px;
          }

          .brand-section {
            margin-bottom: 23px;
          }

          .brand-name {
            font-size: 39px;
          }

          .tagline {
            font-size: 15px;
          }

          .login-card {
            padding:
              28px 21px 30px;
          }

          .login-heading h2 {
            font-size: 22px;
          }

          .login-heading p {
            font-size: 13px;
          }

          .chakra {
            width: 280px;
            height: 280px;

            right: -170px;
            top: 410px;
          }

          .chakra::after {
            width: 225px;
            height: 225px;
          }

          .login-footer {
            padding:
              18px 20px;
          }

          .login-footer {
            flex-direction: column;

            justify-content: center;

            gap: 11px;

            text-align: center;
          }

          .footer-left {
            max-width: 100%;

            font-size: 11px;
          }

          .footer-right {
            margin-left: 0;

            flex-wrap: wrap;

            justify-content: center;

            font-size: 11px;
          }

        }

      `}</style>

    </div>
  );
};

export default Login;


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

    // Save registered account locally
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

    // After account creation → Login
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex">

      {/* =====================================================
          LEFT SIDE - NIYAM DRISHTI BRANDING
      ====================================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B5ED7] items-center justify-center px-12">

        <div className="text-center text-white">

          {/* Logo */}
          <img
            src="/images/Newlogo.png"
            alt="Niyam Drishti"
            className="h-24 mx-auto mb-8 object-contain"
          />

          {/* Niyam Drishti */}
          <h1 className="text-5xl font-bold tracking-wide">
            Niyam Drishti
          </h1>

          {/* Tagline */}
          <p className="text-xl mt-4 text-blue-100">
            See The Label. Know The Truth.
          </p>

          {/* Description */}
          <div className="mt-8 max-w-md mx-auto">
            <p className="text-blue-100 text-sm leading-6">
              AI-assisted packaged commodity compliance
              and inspection platform.
            </p>
          </div>

        </div>
      </div>


      {/* =====================================================
          RIGHT SIDE - CREATE ACCOUNT
      ====================================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          {/* =================================================
              MOBILE BRANDING
          ================================================== */}
          <div className="text-center mb-8 lg:hidden">

            <img
              src="/images/Newlogo.png"
              alt="Niyam Drishti"
              className="h-16 mx-auto mb-4 object-contain"
            />

            <h1 className="text-3xl font-bold text-gray-900">
              Niyam Drishti
            </h1>

          </div>


          {/* =================================================
              HEADING
          ================================================== */}
          <div className="text-center mb-8">

            <h1 className="text-3xl font-bold text-gray-900">
              Create an Account
            </h1>

            <p className="text-gray-500 mt-2">
              Create your Niyam Drishti account
            </p>

          </div>


          {/* =================================================
              FORM CARD
          ================================================== */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">

            <form
              onSubmit={handleCreateAccount}
              className="space-y-5"
            >

              {/* ================= FULL NAME ================= */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* ================= EMAIL ================= */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* ================= ACCOUNT TYPE ================= */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
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


              {/* ================= PASSWORD ================= */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* ================= CONFIRM PASSWORD ================= */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

              </div>


              {/* ================= CREATE ACCOUNT BUTTON ================= */}
              <button
                type="submit"
                className="w-full bg-[#0B5ED7] hover:bg-[#084298] text-white font-semibold py-3 rounded-lg transition-all duration-200"
              >
                Create Account
              </button>

            </form>


            {/* =================================================
                LOGIN LINK
            ================================================== */}
            <div className="text-center mt-6">

              <p className="text-sm text-gray-500">

                Already have an account?{" "}

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Login
                </button>

              </p>

            </div>

          </div>


          {/* =================================================
              BACK TO HOME
          ================================================== */}
          <div className="text-center mt-6">

            <button
              onClick={() => navigate("/")}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              ← Back to Home
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default CreateAccount;


import {
  Eye,
  EyeOff,
  ShieldCheck,
  ScanLine,
  FileCheck2,
  BarChart3,
  ArrowRight,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";


function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });


  // ==========================================
  // HANDLE INPUT CHANGES
  // ==========================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  // ==========================================
  // HANDLE LOGIN
  // ==========================================

  const handleLogin = (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("Please enter your email and password.");
      return;
    }


    // Create user data
    const userData = {
      name: "Inspector",
      email: formData.email,
      role: "Enforcement Officer",
    };


    // Save user in AuthContext
    login(userData);


    // Go to dashboard
    navigate("/");
  };


  return (
    <div className="min-h-screen bg-[#F6F8FC] flex">


      {/* ==========================================
          LEFT SECTION
          ========================================== */}

      <section className="hidden lg:flex lg:w-[48%] bg-[#0B1220] relative overflow-hidden">

        {/* Background effects */}

        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>

        <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl"></div>


        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">


          {/* Logo */}

          <div>

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">

                <ShieldCheck
                  size={27}
                  className="text-white"
                />

              </div>


              <div>

                <h1 className="text-2xl font-bold text-white">

                  Label
                  <span className="text-cyan-400">
                    Lens
                  </span>

                </h1>

                <p className="text-xs text-slate-400">
                  Compliance Intelligence
                </p>

              </div>

            </div>

          </div>


          {/* Main content */}

          <div className="max-w-lg">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-6">

              <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>

              AI-assisted inspection platform

            </div>


            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">

              Smarter inspections.

              <span className="block text-blue-400">
                Better compliance.
              </span>

            </h2>


            <p className="text-slate-400 text-base leading-7 mt-6 max-w-md">

              LabelLens helps enforcement officers analyze packaged
              commodity labels, identify potential compliance issues,
              and generate inspection reports.

            </p>


            {/* Features */}

            <div className="mt-10 space-y-5">


              {/* Feature 1 */}

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">

                  <ScanLine
                    size={19}
                    className="text-blue-400"
                  />

                </div>


                <div>

                  <p className="text-sm font-semibold text-white">
                    Intelligent Label Analysis
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Extract and analyze product declarations
                  </p>

                </div>

              </div>


              {/* Feature 2 */}

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">

                  <FileCheck2
                    size={19}
                    className="text-cyan-400"
                  />

                </div>


                <div>

                  <p className="text-sm font-semibold text-white">
                    Rule-Based Compliance
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Check mandatory packaged commodity declarations
                  </p>

                </div>

              </div>


              {/* Feature 3 */}

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">

                  <BarChart3
                    size={19}
                    className="text-emerald-400"
                  />

                </div>


                <div>

                  <p className="text-sm font-semibold text-white">
                    Inspection Intelligence
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Track findings, reports and inspection trends
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* Footer */}

          <div>

            <div className="h-px bg-white/10 mb-5"></div>

            <p className="text-xs text-slate-500">
              Legal Metrology Inspection System
            </p>

          </div>

        </div>

      </section>


      {/* ==========================================
          RIGHT SECTION
          ========================================== */}

      <section className="w-full lg:w-[52%] flex items-center justify-center p-6 sm:p-10">

        <div className="w-full max-w-md">


          {/* Mobile logo */}

          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">

            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">

              <ShieldCheck
                size={24}
                className="text-white"
              />

            </div>


            <div>

              <h1 className="text-2xl font-bold text-slate-900">

                Label
                <span className="text-blue-600">
                  Lens
                </span>

              </h1>

              <p className="text-xs text-slate-500">
                Compliance Intelligence
              </p>

            </div>

          </div>


          {/* Heading */}

          <div className="mb-8">

            <p className="text-sm font-medium text-blue-600 mb-2">
              INSPECTOR PORTAL
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Welcome back
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Sign in to continue to your inspection dashboard.
            </p>

          </div>


          {/* Login card */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-8">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >


              {/* Email */}

              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="inspector@example.com"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />

              </div>


              {/* Password */}

              <div>

                <div className="flex items-center justify-between mb-2">

                  <label className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>

                </div>


                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />


                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >

                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}

                  </button>

                </div>

              </div>


              {/* Remember me */}

              <div className="flex items-center justify-between">

                <label className="flex items-center gap-2 cursor-pointer">

                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />

                  <span className="text-sm text-slate-600">
                    Remember me
                  </span>

                </label>

              </div>


              {/* Sign in */}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >

                Sign In

                <ArrowRight size={18} />

              </button>

            </form>


            {/* Signup */}

            <div className="mt-7 pt-6 border-t border-slate-100 text-center">

              <p className="text-sm text-slate-500">

                Don't have an account?

                <button
                  onClick={() => navigate("/signup")}
                  className="ml-1.5 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Create an account
                </button>

              </p>

            </div>

          </div>


          {/* Security */}

          <div className="flex items-center justify-center gap-2 mt-6">

            <ShieldCheck
              size={15}
              className="text-green-600"
            />

            <span className="text-xs text-slate-500">
              Secure access for authorized personnel
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Login;
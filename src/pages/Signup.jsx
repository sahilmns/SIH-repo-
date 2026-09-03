import {
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      alert("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    // Demo registration.
    // Later this will connect to the backend registration API.

    alert("Account created successfully!");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex">

      {/* LEFT SECTION */}
      <section className="hidden lg:flex lg:w-[48%] bg-[#0B1220] relative overflow-hidden">

        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl"></div>

        <div className="absolute -bottom-40 -right-20 w-96 h-96 rounded-full bg-cyan-400/10 blur-3xl"></div>

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16">

          {/* LOGO */}
          <div>
            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/30">
                <ShieldCheck size={27} className="text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  Label<span className="text-cyan-400">Lens</span>
                </h1>

                <p className="text-xs text-slate-400">
                  Compliance Intelligence
                </p>
              </div>

            </div>
          </div>

          {/* CONTENT */}
          <div className="max-w-lg">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-6">

              <UserPlus size={14} />

              Inspector Registration

            </div>

            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">

              Start smarter.
              <span className="block text-blue-400">
                Inspect better.
              </span>

            </h2>

            <p className="text-slate-400 text-base leading-7 mt-6 max-w-md">
              Create your LabelLens account and access an intelligent
              platform for packaged commodity compliance inspections.
            </p>

            {/* FEATURES */}
            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <CheckCircle2 size={19} className="text-blue-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    AI-Assisted Inspection
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Analyze packaged commodity labels efficiently
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <CheckCircle2 size={19} className="text-cyan-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Compliance Verification
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Identify potential declaration violations
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <CheckCircle2 size={19} className="text-emerald-400" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Inspection Reports
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Maintain organized inspection records
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* FOOTER */}
          <div>

            <div className="h-px bg-white/10 mb-5"></div>

            <p className="text-xs text-slate-500">
              Legal Metrology Inspection System
            </p>

          </div>

        </div>

      </section>


      {/* RIGHT SECTION */}
      <section className="w-full lg:w-[52%] flex items-center justify-center p-6 sm:p-10">

        <div className="w-full max-w-md">

          {/* MOBILE LOGO */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">

            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center">
              <ShieldCheck size={24} className="text-white" />
            </div>

            <div>

              <h1 className="text-2xl font-bold text-slate-900">
                Label<span className="text-blue-600">Lens</span>
              </h1>

              <p className="text-xs text-slate-500">
                Compliance Intelligence
              </p>

            </div>

          </div>


          {/* HEADING */}
          <div className="mb-8">

            <p className="text-sm font-medium text-blue-600 mb-2">
              INSPECTOR PORTAL
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Create your account
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Register to access the LabelLens inspection dashboard.
            </p>

          </div>


          {/* FORM */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-8">

            <form onSubmit={handleSignup} className="space-y-5">

              {/* NAME */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />

              </div>


              {/* EMAIL */}
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


              {/* PASSWORD */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full px-4 py-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
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


              {/* CONFIRM PASSWORD */}
              <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Confirm Password
                </label>

                <div className="relative">

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>

                </div>

              </div>


              {/* SIGNUP BUTTON */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >

                Create Account

                <ArrowRight size={18} />

              </button>

            </form>


            {/* LOGIN LINK */}
            <div className="mt-7 pt-6 border-t border-slate-100 text-center">

              <p className="text-sm text-slate-500">

                Already have an account?

                <button
                  onClick={() => navigate("/login")}
                  className="ml-1.5 font-semibold text-blue-600 hover:text-blue-700"
                >
                  Sign in
                </button>

              </p>

            </div>

          </div>


          {/* SECURITY */}
          <div className="flex items-center justify-center gap-2 mt-6">

            <ShieldCheck size={15} className="text-green-600" />

            <span className="text-xs text-slate-500">
              Secure access for authorized personnel
            </span>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Signup;
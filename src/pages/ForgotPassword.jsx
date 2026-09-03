import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    // Demo password reset.
    // Later this will connect to the backend/API.

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex">

      {/* =====================================
          LEFT SECTION
         ===================================== */}

      <section className="hidden lg:flex lg:w-[48%] bg-[#0B1220] relative overflow-hidden">

        {/* Background Effects */}

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


          {/* Main Content */}

          <div className="max-w-lg">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-medium mb-6">

              <Mail size={14} />

              Account Recovery

            </div>


            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight">

              Get back to
              <span className="block text-blue-400">
                your inspections.
              </span>

            </h2>


            <p className="text-slate-400 text-base leading-7 mt-6 max-w-md">

              Forgot your password? Enter your registered email address
              and we'll help you recover access to your LabelLens account.

            </p>


            {/* Features */}

            <div className="mt-10 space-y-5">

              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">

                  <CheckCircle2
                    size={19}
                    className="text-blue-400"
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold text-white">
                    Secure Recovery
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Password recovery through registered email
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">

                  <CheckCircle2
                    size={19}
                    className="text-cyan-400"
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold text-white">
                    Protected Access
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Keep your inspection data secure
                  </p>

                </div>

              </div>


              <div className="flex items-center gap-4">

                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">

                  <CheckCircle2
                    size={19}
                    className="text-emerald-400"
                  />

                </div>

                <div>

                  <p className="text-sm font-semibold text-white">
                    Quick Access
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    Return to your inspection dashboard
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


      {/* =====================================
          RIGHT SECTION
         ===================================== */}

      <section className="w-full lg:w-[52%] flex items-center justify-center p-6 sm:p-10">

        <div className="w-full max-w-md">


          {/* Mobile Logo */}

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
              ACCOUNT RECOVERY
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Forgot your password?
            </h2>

            <p className="text-sm text-slate-500 mt-2">
              Enter your email address to reset your password.
            </p>

          </div>


          {/* Card */}

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 sm:p-8">


            {!submitted ? (

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Email */}

                <div>

                  <label className="block text-sm font-semibold text-slate-700 mb-2">

                    Email Address

                  </label>

                  <div className="relative">

                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="inspector@example.com"
                      className="w-full px-4 py-3.5 pr-12 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />

                    <Mail
                      size={19}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                  </div>

                </div>


                {/* Button */}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >

                  Send Reset Link

                  <ArrowRight size={18} />

                </button>

              </form>

            ) : (

              /* =================================
                 SUCCESS MESSAGE
                 ================================= */

              <div className="text-center py-4">

                <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-5">

                  <CheckCircle2
                    size={30}
                    className="text-green-600"
                  />

                </div>


                <h3 className="text-xl font-bold text-slate-900">
                  Check your email
                </h3>


                <p className="text-sm text-slate-500 leading-6 mt-3">

                  If an account exists for{" "}

                  <span className="font-semibold text-slate-700">
                    {email}
                  </span>

                  , a password reset link has been sent.

                </p>


                <button
                  onClick={() => navigate("/login")}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all"
                >

                  Back to Login

                  <ArrowRight size={18} />

                </button>

              </div>

            )}


            {/* Back to Login */}

            {!submitted && (

              <div className="mt-7 pt-6 border-t border-slate-100 text-center">

                <button
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >

                  <ArrowLeft size={16} />

                  Back to Login

                </button>

              </div>

            )}

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

export default ForgotPassword;
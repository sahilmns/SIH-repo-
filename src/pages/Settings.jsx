import {
  ArrowLeft,
  User,
  Bell,
  ShieldCheck,
  Database,
  Save,
  Info,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Settings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    inspectorName: "Inspector",
    designation: "Enforcement Officer",
    email: "inspector@example.com",
    notifications: true,
    inspectionAlerts: true,
    reportNotifications: true,
    autoSave: true,
  });

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Frontend placeholder.
    // Later this can call the backend settings API.
    alert("Settings saved successfully.");
  };

  return (
    <main className="p-6 lg:p-8 bg-[#F6F8FC] min-h-[calc(100vh-80px)]">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">

        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Settings
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Manage your inspection preferences and account settings
          </p>
        </div>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2.5
                     bg-white border border-slate-200
                     rounded-xl text-sm font-medium text-slate-600
                     hover:bg-slate-50 hover:text-slate-900
                     transition-all duration-200"
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Profile */}
        <section className="xl:col-span-2 bg-white rounded-2xl
                            border border-slate-200 shadow-sm">

          <div className="p-6 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-blue-50
                              flex items-center justify-center
                              text-blue-600">
                <User size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Inspector Profile
                </h2>

                <p className="text-sm text-slate-500">
                  Manage your basic account information
                </p>
              </div>

            </div>

          </div>

          <div className="p-6 space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Inspector Name
              </label>

              <input
                type="text"
                value={settings.inspectorName}
                onChange={(e) =>
                  handleChange("inspectorName", e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl
                           border border-slate-200
                           focus:outline-none focus:ring-2
                           focus:ring-blue-500/20
                           focus:border-blue-500
                           text-sm text-slate-900"
              />
            </div>

            {/* Designation */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Designation
              </label>

              <input
                type="text"
                value={settings.designation}
                onChange={(e) =>
                  handleChange("designation", e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl
                           border border-slate-200
                           focus:outline-none focus:ring-2
                           focus:ring-blue-500/20
                           focus:border-blue-500
                           text-sm text-slate-900"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>

              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  handleChange("email", e.target.value)
                }
                className="w-full px-4 py-3 rounded-xl
                           border border-slate-200
                           focus:outline-none focus:ring-2
                           focus:ring-blue-500/20
                           focus:border-blue-500
                           text-sm text-slate-900"
              />
            </div>

          </div>
        </section>


        {/* System Information */}
        <section className="bg-white rounded-2xl
                            border border-slate-200 shadow-sm h-fit">

          <div className="p-6 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-emerald-50
                              flex items-center justify-center
                              text-emerald-600">
                <Database size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  System Information
                </h2>

                <p className="text-sm text-slate-500">
                  Current system configuration
                </p>
              </div>

            </div>

          </div>

          <div className="p-6 space-y-5">

            <div>
              <p className="text-xs text-slate-500">
                Platform
              </p>

              <p className="text-sm font-semibold text-slate-900 mt-1">
                LabelLens
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Compliance Rules
              </p>

              <p className="text-sm font-semibold text-slate-900 mt-1">
                Legal Metrology Rules
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Rule Engine
              </p>

              <p className="text-sm font-semibold text-green-600 mt-1">
                Ready
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                System Version
              </p>

              <p className="text-sm font-semibold text-slate-900 mt-1">
                Prototype v1.0
              </p>
            </div>

          </div>

        </section>


        {/* Notifications */}
        <section className="xl:col-span-2 bg-white rounded-2xl
                            border border-slate-200 shadow-sm">

          <div className="p-6 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-amber-50
                              flex items-center justify-center
                              text-amber-600">
                <Bell size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Notifications
                </h2>

                <p className="text-sm text-slate-500">
                  Choose which notifications you want to receive
                </p>
              </div>

            </div>

          </div>

          <div className="p-6 space-y-1">

            {/* Notification Toggle */}
            <div className="flex items-center justify-between
                            py-4 border-b border-slate-100">

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Notifications
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Enable system notifications
                </p>
              </div>

              <button
                onClick={() =>
                  handleChange(
                    "notifications",
                    !settings.notifications
                  )
                }
                className={`w-11 h-6 rounded-full transition-all
                  ${settings.notifications
                    ? "bg-blue-600"
                    : "bg-slate-300"
                  }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full
                    shadow-sm transition-transform
                    ${settings.notifications
                      ? "translate-x-5"
                      : "translate-x-0.5"
                    }`}
                />
              </button>

            </div>


            {/* Inspection Alerts */}
            <div className="flex items-center justify-between
                            py-4 border-b border-slate-100">

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Inspection Alerts
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Get alerts for inspections requiring attention
                </p>
              </div>

              <button
                onClick={() =>
                  handleChange(
                    "inspectionAlerts",
                    !settings.inspectionAlerts
                  )
                }
                className={`w-11 h-6 rounded-full transition-all
                  ${settings.inspectionAlerts
                    ? "bg-blue-600"
                    : "bg-slate-300"
                  }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full
                    shadow-sm transition-transform
                    ${settings.inspectionAlerts
                      ? "translate-x-5"
                      : "translate-x-0.5"
                    }`}
                />
              </button>

            </div>


            {/* Reports */}
            <div className="flex items-center justify-between
                            py-4">

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Report Notifications
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  Receive notifications when reports are generated
                </p>
              </div>

              <button
                onClick={() =>
                  handleChange(
                    "reportNotifications",
                    !settings.reportNotifications
                  )
                }
                className={`w-11 h-6 rounded-full transition-all
                  ${settings.reportNotifications
                    ? "bg-blue-600"
                    : "bg-slate-300"
                  }`}
              >
                <span
                  className={`block w-5 h-5 bg-white rounded-full
                    shadow-sm transition-transform
                    ${settings.reportNotifications
                      ? "translate-x-5"
                      : "translate-x-0.5"
                    }`}
                />
              </button>

            </div>

          </div>

        </section>


        {/* Security */}
        <section className="bg-white rounded-2xl
                            border border-slate-200 shadow-sm h-fit">

          <div className="p-6 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-purple-50
                              flex items-center justify-center
                              text-purple-600">
                <ShieldCheck size={21} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Security
                </h2>

                <p className="text-sm text-slate-500">
                  Inspection data protection
                </p>
              </div>

            </div>

          </div>

          <div className="p-6">

            <div className="flex items-start gap-3">

              <Info
                size={18}
                className="text-blue-500 mt-0.5"
              />

              <p className="text-sm text-slate-500 leading-6">
                Inspection evidence and compliance findings
                should be securely stored and accessible only
                to authorized users.
              </p>

            </div>

          </div>

        </section>

      </div>


      {/* Save Button */}
      <div className="flex justify-end mt-6">

        <button
          onClick={handleSave}
          className="flex items-center gap-2
                     bg-blue-600 hover:bg-blue-700
                     text-white font-semibold
                     px-6 py-3 rounded-xl
                     shadow-sm hover:shadow-md
                     transition-all duration-200"
        >
          <Save size={18} />
          Save Changes
        </button>

      </div>

    </main>
  );
}

export default Settings;
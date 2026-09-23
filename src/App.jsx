import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Menu } from "lucide-react";

import ScrollProgress from "./components/ScrollProgress";

import { InspectionProvider } from "./context/InspectionContext";
import { AuthProvider } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/navbar";
import GovernmentPageHeader from "./components/GovernmentPageHeader";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

/* =========================================================
   INSPECTOR / EXISTING PAGES
========================================================= */

import Dashboard from "./pages/Dashboard";
import NewInspection from "./pages/NewInspection";
import ImageReview from "./pages/ImageReview";
import OnlineProductReview from "./pages/OnlineProductReview";
import Analysis from "./pages/Analysis";
import ComplianceResult from "./pages/ComplianceResult";
import EvidenceReview from "./pages/EvidenceReview";
import Report from "./pages/Report";
import History from "./pages/History";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

/* =========================================================
   CONSUMER PAGES
========================================================= */

import ConsumerDashboard from "./pages/ConsumerDashboard";
import ConsumerHistory from "./pages/ConsumerHistory";
import ConsumerReportIssue from "./pages/ConsumerReportIssue";
import ConsumerReports from "./pages/ConsumerReports";
import ConsumerScan from "./pages/ConsumerScan";


/* =========================================================
   MAIN LAYOUT
========================================================= */

function MainLayout({ children, showNavbar = false }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7FA]">

      {/* =================================================
          SCROLL PROGRESS BAR
      ================================================== */}

      <ScrollProgress />


      {/* =================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />


      {/* =================================================
          MAIN CONTENT
      ================================================== */}

      <main className="min-h-screen">

        {/* =================================================
            HOME / DASHBOARD NAVBAR
        ================================================== */}

        {showNavbar && (
          <Navbar
            setSidebarOpen={setSidebarOpen}
          />
        )}


        {/* =================================================
            INTERNAL PAGE HEADER
        ================================================== */}

        {!showNavbar && (
          <div className="relative">

            {/* Existing Government Header */}

            <GovernmentPageHeader />


            {/* =================================================
                PERMANENT MENU BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              title="Open menu"
              className="
                absolute
                top-0
                left-3
                z-[100]
                flex
                items-center
                justify-center
                w-10
                h-[44px]
                text-white
                hover:bg-white/10
                transition-colors
                duration-200
              "
            >

              <Menu
                size={24}
                strokeWidth={2}
              />

            </button>

          </div>
        )}


        {/* =================================================
            PAGE CONTENT
        ================================================== */}

        {children}


        {/* =================================================
            INTERNAL PAGE FOOTER
        ================================================== */}

        {!showNavbar && (
          <footer
            className="
              mt-10
              bg-[#06345b]
              text-white
              border-t-4
              border-[#ff9933]
            "
          >

            <div
              className="
                max-w-[1500px]
                mx-auto
                px-5
                lg:px-10
                py-6
              "
            >

              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  items-center
                  justify-between
                  gap-4
                "
              >

                {/* =================================================
                    BRAND
                ================================================== */}

                <div className="text-center md:text-left">

                  <p className="font-bold text-sm">
                    NiyamDrishti
                  </p>

                  <p className="text-xs text-white/65 mt-1">
                    Digital Legal Metrology Inspection Portal
                  </p>

                </div>


                {/* =================================================
                    TEAM
                ================================================== */}

                <p className="text-xs text-white/80">
                  Made with ❤️ by Metra-X
                </p>


                {/* =================================================
                    GOVERNMENT
                ================================================== */}

                <p className="text-xs text-white/55 text-center">
                  Government of India • Department of Consumer Affairs
                </p>

              </div>

            </div>


            {/* =================================================
                TRICOLOUR
            ================================================== */}

            <div className="flex h-[3px]">

              <div className="w-1/3 bg-[#ff9933]" />

              <div className="w-1/3 bg-white" />

              <div className="w-1/3 bg-[#138808]" />

            </div>

          </footer>
        )}

      </main>

    </div>
  );
}


/* =========================================================
   PROTECTED PAGE
========================================================= */

function ProtectedPage({
  children,
  showNavbar = false,
  allowedRoles
}) {

  return (

    <ProtectedRoute
      allowedRoles={allowedRoles}
    >

      <MainLayout
        showNavbar={showNavbar}
      >

        {children}

      </MainLayout>

    </ProtectedRoute>
  );
}


/* =========================================================
   APP
========================================================= */

function App() {

  return (

    <BrowserRouter>

      <AuthProvider>

        <InspectionProvider>

          <Routes>


            {/* =================================================
                PUBLIC AUTH ROUTES
            ================================================== */}

            {/* ================= LOGIN ================= */}

            <Route
              path="/login"
              element={<Login />}
            />


            {/* ================= CREATE ACCOUNT ================= */}

            <Route
              path="/signup"
              element={<Signup />}
            />


            {/* ================= FORGOT PASSWORD ================= */}

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />


            {/* =================================================
                INSPECTOR ROUTES
            ================================================== */}

            {/* ================= INSPECTOR DASHBOARD ================= */}

            <Route
              path="/"
              element={
                <ProtectedPage
                  showNavbar={true}
                  allowedRoles={["inspector"]}
                >
                  <Dashboard />
                </ProtectedPage>
              }
            />


            {/* ================= NEW INSPECTION ================= */}

            <Route
              path="/new-inspection"
              element={
                <ProtectedPage
                  allowedRoles={[
                    "inspector",
                    "manufacturer"
                  ]}
                >
                  <NewInspection />
                </ProtectedPage>
              }
            />


            {/* ================= IMAGE REVIEW ================= */}

            <Route
              path="/image-review"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <ImageReview />
                </ProtectedPage>
              }
            />


            {/* ================= ONLINE PRODUCT REVIEW ================= */}

            <Route
              path="/online-product-review"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <OnlineProductReview />
                </ProtectedPage>
              }
            />


            {/* ================= ANALYSIS ================= */}

            <Route
              path="/analysis"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <Analysis />
                </ProtectedPage>
              }
            />


            {/* ================= COMPLIANCE RESULT ================= */}

            <Route
              path="/compliance-result"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <ComplianceResult />
                </ProtectedPage>
              }
            />


            {/* ================= EVIDENCE REVIEW ================= */}

            <Route
              path="/evidence-review"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <EvidenceReview />
                </ProtectedPage>
              }
            />


            {/* ================= REPORT ================= */}

            <Route
              path="/report"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <Report />
                </ProtectedPage>
              }
            />


            {/* ================= HISTORY ================= */}

            <Route
              path="/history"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <History />
                </ProtectedPage>
              }
            />


            {/* ================= ANALYTICS ================= */}

            <Route
              path="/analytics"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <Analytics />
                </ProtectedPage>
              }
            />


            {/* ================= REPORTS ================= */}

            <Route
              path="/reports"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <Reports />
                </ProtectedPage>
              }
            />


            {/* ================= SETTINGS ================= */}

            <Route
              path="/settings"
              element={
                <ProtectedPage
                  allowedRoles={["inspector"]}
                >
                  <Settings />
                </ProtectedPage>
              }
            />


            {/* =================================================
                CONSUMER ROUTES
            ================================================== */}

            {/* ================= CONSUMER DASHBOARD ================= */}

            <Route
              path="/consumer-dashboard"
              element={
                <ProtectedPage
                  showNavbar={true}
                  allowedRoles={["consumer"]}
                >
                  <ConsumerDashboard />
                </ProtectedPage>
              }
            />


            {/* ================= CONSUMER SCAN ================= */}

            <Route
              path="/consumer-scan"
              element={
                <ProtectedPage
                  allowedRoles={["consumer"]}
                >
                  <ConsumerScan />
                </ProtectedPage>
              }
            />


            {/* ================= CONSUMER HISTORY ================= */}

            <Route
              path="/consumer-history"
              element={
                <ProtectedPage
                  allowedRoles={["consumer"]}
                >
                  <ConsumerHistory />
                </ProtectedPage>
              }
            />


            {/* ================= CONSUMER REPORT ISSUE ================= */}

            <Route
              path="/consumer-report-issue"
              element={
                <ProtectedPage
                  allowedRoles={["consumer"]}
                >
                  <ConsumerReportIssue />
                </ProtectedPage>
              }
            />


            {/* ================= CONSUMER REPORTS ================= */}

            <Route
              path="/consumer-reports"
              element={
                <ProtectedPage
                  allowedRoles={["consumer"]}
                >
                  <ConsumerReports />
                </ProtectedPage>
              }
            />


          </Routes>

        </InspectionProvider>

      </AuthProvider>

    </BrowserRouter>
    
  );
}


export default App;


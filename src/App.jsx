import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScrollProgress from "./components/ScrollProgress";

import { InspectionProvider } from "./context/InspectionContext";
import { AuthProvider } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

import Dashboard from "./pages/Dashboard";
import ConsumerDashboard from "./pages/ConsumerDashboard";
import ConsumerScan from "./pages/ConsumerScan";
import ConsumerReportIssue from "./pages/ConsumerReportIssue";
import ConsumerHistory from "./pages/ConsumerHistory";
import ConsumerReports from "./pages/ConsumerReports";

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


function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F6F8FC]">

      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Sidebar */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <main className="min-h-screen">

        {/* Navbar */}
        <Navbar
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content */}
        {children}

      </main>

    </div>
  );
}


function ProtectedPage({ children }) {
  return (
    <ProtectedRoute>
      <MainLayout>
        {children}
      </MainLayout>
    </ProtectedRoute>
  );
}


function App() {

  return (

    <BrowserRouter>

      <AuthProvider>

        <InspectionProvider>

          <Routes>

            {/* PUBLIC AUTH ROUTES */}


            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            <Route
              path="/forgot-password"
              element={<ForgotPassword />}
            />


            {/* ========================= */}
            {/* PROTECTED APP ROUTES */}
            {/* ========================= */}

            {/* Inspector Dashboard */}
            <Route
              path="/"
              element={
                <ProtectedPage>
                  <Dashboard />
                </ProtectedPage>
              }
            />


            {/* ========================= */}
            {/* CONSUMER ROUTES */}
            {/* ========================= */}

            {/* Consumer Dashboard */}
            <Route
              path="/consumer-dashboard"
              element={
                <ProtectedPage>
                  <ConsumerDashboard />
                </ProtectedPage>
              }
            />

            {/* Consumer Scan Product */}
            <Route
              path="/consumer-scan"
              element={
                <ProtectedPage>
                  <ConsumerScan />
                </ProtectedPage>
              }
            />

            {/* Consumer Report Issue */}
            <Route
              path="/consumer-report-issue"
              element={
                <ProtectedPage>
                  <ConsumerReportIssue />
                </ProtectedPage>
              }
            />

            {/* Consumer My Scans */}
            <Route
              path="/consumer-history"
              element={
                <ProtectedPage>
                  <ConsumerHistory />
                </ProtectedPage>
              }
            />

            {/* Consumer Reports */}
            <Route
              path="/consumer-reports"
              element={
                <ProtectedPage>
                  <ConsumerReports />
                </ProtectedPage>
              }
            />


            {/* ========================= */}
            {/* INSPECTOR ROUTES */}
            {/* ========================= */}

            <Route
              path="/new-inspection"
              element={
                <ProtectedPage>
                  <NewInspection />
                </ProtectedPage>
              }
            />

            <Route
              path="/image-review"
              element={
                <ProtectedPage>
                  <ImageReview />
                </ProtectedPage>
              }
            />

            <Route
              path="/online-product-review"
              element={
                <ProtectedPage>
                  <OnlineProductReview />
                </ProtectedPage>
              }
            />

            <Route
              path="/analysis"
              element={
                <ProtectedPage>
                  <Analysis />
                </ProtectedPage>
              }
            />

            <Route
              path="/compliance-result"
              element={
                <ProtectedPage>
                  <ComplianceResult />
                </ProtectedPage>
              }
            />

            <Route
              path="/evidence-review"
              element={
                <ProtectedPage>
                  <EvidenceReview />
                </ProtectedPage>
              }
            />

            <Route
              path="/report"
              element={
                <ProtectedPage>
                  <Report />
                </ProtectedPage>
              }
            />

            <Route
              path="/history"
              element={
                <ProtectedPage>
                  <History />
                </ProtectedPage>
              }
            />

            <Route
              path="/analytics"
              element={
                <ProtectedPage>
                  <Analytics />
                </ProtectedPage>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedPage>
                  <Reports />
                </ProtectedPage>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedPage>
                  <Settings />
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


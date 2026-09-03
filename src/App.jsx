import { BrowserRouter, Routes, Route } from "react-router-dom";

import { InspectionProvider } from "./context/InspectionContext";
import { AuthProvider } from "./context/AuthContext";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";

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


function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F6F8FC]">

      <Sidebar />

      <main className="ml-64 min-h-screen">

        <Navbar />

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

            {/* ========================= */}
            {/* PUBLIC AUTH ROUTES */}
            {/* ========================= */}

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

            <Route
              path="/"
              element={
                <ProtectedPage>
                  <Dashboard />
                </ProtectedPage>
              }
            />

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
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  /* =====================================================
     ROLE PROTECTION
     
     If allowedRoles is provided, check user's role.
  ===================================================== */

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {

    /* ================================================
       SEND USER TO THEIR OWN DASHBOARD
    ================================================ */

    if (user?.role === "consumer") {
      return (
        <Navigate
          to="/consumer-dashboard"
          replace
        />
      );
    }

    if (user?.role === "inspector") {
      return (
        <Navigate
          to="/"
          replace
        />
      );
    }

    if (user?.role === "manufacturer") {
      return (
        <Navigate
          to="/new-inspection"
          replace
        />
      );
    }

    /* ================================================
       UNKNOWN ROLE
    ================================================ */

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =====================================================
     AUTHENTICATED + AUTHORIZED
  ===================================================== */

  return children;
}

export default ProtectedRoute;


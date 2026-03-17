import { createBrowserRouter, Outlet, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import { AdminThemeProvider } from "../features/admin/hooks/AdminThemeContext";

// ── Auth ──────────────────────────────────────────────────────────────
import Login    from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

// ── User ──────────────────────────────────────────────────────────────
import UserLanding from "../features/user/pages/UserLanding";
import Dashboard   from "../features/user/pages/Dashboard";
import Kuesioner   from "../features/user/pages/Kuesioner";
import Profile     from "../features/user/pages/Profile";

// ── Admin: Overview ──────────────────────────────────────────────────
import AdminLanding  from "../features/admin/pages/overview/AdminLanding";
import Analytics     from "../features/admin/pages/overview/Analytics";
import ClusterDetail from "../features/admin/pages/overview/ClusterDetail";

// ── Admin: Data Management ───────────────────────────────────────────
import AdminData           from "../features/admin/pages/data-management/AdminData";
import Respondent          from "../features/admin/pages/data-management/Respondent";
import RespondentDetail    from "../features/admin/pages/data-management/RespondentDetail";
import RespondentScoreDetail from "../features/admin/pages/data-management/RespondentScoreDetail";
import StatusKuesioner     from "../features/admin/pages/data-management/StatusKuesioner";

// ── Admin: Access Control ────────────────────────────────────────────
import AdminAccount from "../features/admin/pages/access-control/AdminAccount";
import UserAccount  from "../features/admin/pages/access-control/UserAccount";
import AdminProfile from "../features/admin/pages/access-control/profile/AdminProfile";

function RootWrapper() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Outlet key={location.pathname} />
    </AnimatePresence>
  );
}

function AdminWrapper() {
  return (
    <AdminThemeProvider>
      <Outlet />
    </AdminThemeProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootWrapper,
    children: [
      // Auth
      { index: true,       Component: Login    },
      { path: "register",  Component: Register },

      // User
      { path: "welcome",   Component: UserLanding },
      { path: "dashboard", Component: Dashboard   },
      { path: "kuesioner", Component: Kuesioner   },
      
      // Admin area (Theme Provider wrapper)
      {
        path: "admin",
        Component: AdminWrapper,
        children: [
          // Admin: Overview
          { index: true,                          Component: AdminLanding  },
          { path: "analytics",                    Component: Analytics     },
          { path: "analytics/cluster-detail",     Component: ClusterDetail },

          // Admin: Data Management
          { path: "data",                         Component: AdminData           },
          { path: "respondent-management",        Component: Respondent          },
          { path: "respondent/:id",               Component: RespondentDetail    },
          { path: "respondent-score/:id",         Component: RespondentScoreDetail },
          { path: "status-kuesioner",             Component: StatusKuesioner     },

          // Admin: Access Control
          { path: "admin-account",                Component: AdminAccount },
          { path: "user-account",                 Component: UserAccount  },
          { path: "profile",                      Component: AdminProfile },
        ]
      }
    ],
  },
]);
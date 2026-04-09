import { createBrowserRouter, Outlet, useLocation } from "react-router";
import { AnimatePresence } from "framer-motion";
import { AdminThemeProvider } from "../features/admin/hooks/AdminThemeContext";

// ── Auth ──────────────────────────────────────────────────────────────
import Login    from "../features/auth/pages/Login";
import Register from "../features/auth/pages/Register";

// ── User ──────────────────────────────────────────────────────────────
import UserLanding from "../features/user/pages/UserLanding";
import Kuesioner   from "../features/user/pages/Kuesioner";

// ── Admin: Overview ──────────────────────────────────────────────────
import AdminLanding  from "../features/admin/pages/overview/AdminLanding";
import Analytics     from "../features/admin/pages/overview/Analytics";
import ClusterDetail from "../features/admin/pages/overview/ClusterDetail";
import DemografiDetail from "../features/admin/pages/overview/DemografiDetail";
import TrendAnalytics  from "../features/admin/pages/overview/TrendAnalytics";

// ── Admin: Data Management ───────────────────────────────────────────
import AdminData           from "../features/admin/pages/data-management/AdminData";
import Respondent          from "../features/admin/pages/data-management/Respondent";
import RespondentDetail    from "../features/admin/pages/data-management/RespondentDetail";
import RespondentScoreDetail from "../features/admin/pages/data-management/RespondentScoreDetail";
import StatusKuesioner     from "../features/admin/pages/data-management/StatusKuesioner";
import TindakLanjut        from "../features/admin/pages/data-management/TindakLanjut";
import DummyManager        from "../features/admin/pages/data-management/DummyManager";

function RootWrapper() {
  return (
    <Outlet />
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
          { path: "analytics/demografi",          Component: DemografiDetail },
          { path: "analytics/trend",              Component: TrendAnalytics },

          // Admin: Data Management
          { path: "data",                         Component: AdminData           },
          { path: "respondent-management",        Component: Respondent          },
          { path: "respondent/:id",               Component: RespondentDetail    },
          { path: "respondent-score/:id",         Component: RespondentScoreDetail },
          { path: "status-kuesioner",             Component: StatusKuesioner     },
          { path: "tindak-lanjut",                Component: TindakLanjut        },
          { path: "dummy-manager",                Component: DummyManager        },
        ]
      }
    ],
  },
]);
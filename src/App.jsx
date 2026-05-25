// src/App.jsx
import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGetCurrentUser } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { AppLayout } from "./components/layout";
import Login from "./pages/login";
import AdminRouter from "./pages/admin";
import ClientRouter from "./pages/client";
import OpsRouter from "./pages/operations";
import ComprehensiveRequests from './pages/ComprehensiveRequests';
import OperationsRequests from './pages/OperationsRequests';
import ClientReportViewer from "./pages/client/ReportViewerPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, allowedRoles, rolePath, isFullScreen }) {
  const { data: user, isLoading } = useGetCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" replace />;

  const hasAccess = allowedRoles.some(
    (role) => user.role === role || user.role.startsWith(role)
  );

  if (!hasAccess) return <Redirect to="/" replace />;

  // For full-screen routes, render children without the AppLayout
  if (isFullScreen) {
    return children;
  }

  return <AppLayout role={rolePath}>{children}</AppLayout>;
}

function IndexRoute() {
  // ✅ FIX: destructure as { data: user } - useQuery returns { data }, not { user }
  const { data: user, isLoading } = useGetCurrentUser();

  if (isLoading) return null;
  if (!user) return <Redirect to="/login" />;

  const role = user.role?.toLowerCase() || "";

  console.log("INDEX ROLE =", role);

  if (role === "super_admin") return <Redirect to="/admin" />;
  if (role.startsWith("client")) return <Redirect to="/client" />;
  if (role.startsWith("operations")) return <Redirect to="/operations" />;

  return <Redirect to="/login" />;
}

function AppContent() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/admin" nest>
        <ProtectedRoute allowedRoles={["super_admin"]} rolePath="admin">
          <AdminRouter />
        </ProtectedRoute>
      </Route>

      <Route path="/client" nest>
        <ProtectedRoute allowedRoles={["client_"]} rolePath="client">
          <ClientRouter />
        </ProtectedRoute>
      </Route>

      <Route path="/operations" nest>
        <ProtectedRoute allowedRoles={["operations_"]} rolePath="operations">
          <OpsRouter />
        </ProtectedRoute>
      </Route>

      <Route path="/comprehensive-requests" element={<ComprehensiveRequests />} />
      <Route path="/operations-requests" element={<OperationsRequests />} />

      {/* Full-Screen Report Viewer Route – No Layout (No Navbar/Sidebar) */}
      <Route path="/report/:orderId">
        <ProtectedRoute allowedRoles={["client_"]} rolePath="client" isFullScreen={true}>
          <ClientReportViewer />
        </ProtectedRoute>
      </Route>

      <Route path="/" component={IndexRoute} />
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter >
        <AppContent />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
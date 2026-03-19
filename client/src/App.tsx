import { Suspense, lazy } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppStateProvider, useAppState } from "./lib/store";

import AppLayout from "./components/layout/AppLayout";

const AuthPage = lazy(() => import("./pages/auth/AuthPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const FleetPage = lazy(() => import("./pages/fleet/FleetPage"));
const BookingsPage = lazy(() => import("./pages/bookings/BookingsPage"));
const CustomersPage = lazy(() => import("./pages/customers/CustomersPage"));
const TasksPage = lazy(() => import("./pages/tasks/TasksPage"));
const NotesPage = lazy(() => import("./pages/notes/NotesPage"));
const MaintenancePage = lazy(() => import("./pages/maintenance/MaintenancePage"));
const SettingsPage = lazy(() => import("./pages/settings/SettingsPage"));
const FinancialPage = lazy(() => import("./pages/financial/FinancialPage"));
const NexusUltraPage = lazy(() => import("./pages/nexus/NexusUltraPage"));
const NotFound = lazy(() => import("@/pages/not-found"));

function ProtectedRoute({
  component: Component,
}: {
  component: React.ComponentType;
  path?: string;
}) {
  const { isAuthenticated, isLoading } = useAppState();
  if (isLoading) return null;
  if (!isAuthenticated) return <Redirect to="/auth" />;
  return (
    <Suspense fallback={null}>
      <Component />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        <Suspense fallback={null}>
          <AuthPage />
        </Suspense>
      </Route>
      <Route path="/">
        <ProtectedRoute component={DashboardPage} />
      </Route>
      <Route path="/fleet">
        <ProtectedRoute component={FleetPage} />
      </Route>
      <Route path="/bookings">
        <ProtectedRoute component={BookingsPage} />
      </Route>
      <Route path="/customers">
        <ProtectedRoute component={CustomersPage} />
      </Route>
      <Route path="/tasks">
        <ProtectedRoute component={TasksPage} />
      </Route>
      <Route path="/notes">
        <ProtectedRoute component={NotesPage} />
      </Route>
      <Route path="/maintenance">
        <ProtectedRoute component={MaintenancePage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/financial">
        <ProtectedRoute component={FinancialPage} />
      </Route>
      <Route path="/nexus-ultra">
        <ProtectedRoute component={NexusUltraPage} />
      </Route>
      <Route>
        <Suspense fallback={null}>
          <NotFound />
        </Suspense>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppStateProvider>
        <TooltipProvider>
          <Toaster />
          <AppLayout>
            <Router />
          </AppLayout>
        </TooltipProvider>
      </AppStateProvider>
    </QueryClientProvider>
  );
}

export default App;

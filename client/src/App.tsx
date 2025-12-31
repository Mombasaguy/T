import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getOnboardingState } from "@/lib/onboarding";
import { PageTransition } from "@/components/PageTransition";

import Dashboard from "./pages/dashboard";
import Candidates from "./pages/candidates";
import Pipeline from "./pages/pipeline";
import CandidateSearch from "./components/CandidateSearch";
import Stats from "./pages/stats";
import Positions from "./pages/positions";
import Settings from "./pages/settings";
import Pricing from "./pages/pricing";
import Welcome from "./pages/welcome";
import Landing from "./pages/landing";
import Compliance from "./pages/compliance";
import Onboarding from "./pages/onboarding";
import NotFound from "./pages/not-found";

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const state = getOnboardingState();
  
  const publicRoutes = ["/", "/pricing", "/compliance", "/onboarding", "/welcome"];
  const isPublicRoute = publicRoutes.includes(location);
  
  if (!state.onboardingCompleted && !isPublicRoute) {
    return <Redirect to="/onboarding" />;
  }
  
  return <>{children}</>;
}

function InternalRouter() {
  return (
    <OnboardingGuard>
      <PageTransition>
        <Switch>
          <Route path="/search" component={CandidateSearch} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/candidates" component={Candidates} />
          <Route path="/pipeline" component={Pipeline} />
          <Route path="/stats" component={Stats} />
          <Route path="/positions" component={Positions} />
          <Route path="/settings" component={Settings} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/welcome" component={Welcome} />
          <Route path="/compliance" component={Compliance} />
          <Route path="/onboarding" component={Onboarding} />
          <Route component={NotFound} />
        </Switch>
      </PageTransition>
    </OnboardingGuard>
  );
}

function AppContent() {
  const [location] = useLocation();
  
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  if (location === "/") {
    return <Landing />;
  }

  if (location === "/onboarding") {
    return <Onboarding />;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center h-14 px-4 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto">
            <InternalRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

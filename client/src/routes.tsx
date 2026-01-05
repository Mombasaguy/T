import { Switch, Route, useLocation, Redirect } from "wouter";
import { getOnboardingState } from "@/lib/onboarding";
import { PageTransition } from "@/components/PageTransition";

import Dashboard from "./pages/dashboard";
import Candidates from "./pages/Candidates";
import Pipeline from "./pages/pipeline";
import Search from "./pages/Search";
import Stats from "./pages/stats";
import Positions from "./pages/positions";
import Settings from "./pages/settings";
import Pricing from "./pages/pricing";
import Welcome from "./pages/welcome";
import Compliance from "./pages/compliance";
import Onboarding from "./pages/Onboarding";
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

export function InternalRouter() {
  return (
    <OnboardingGuard>
      <PageTransition>
        <Switch>
          <Route path="/search" component={Search} />
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

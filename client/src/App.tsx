import { Switch, Route } from "wouter";
import CandidateSearch from "./components/CandidateSearch";
import Stats from "./pages/stats";

function App() {
  return (
    <Switch>
      <Route path="/" component={CandidateSearch} />
      <Route path="/stats" component={Stats} />
    </Switch>
  );
}

export default App;

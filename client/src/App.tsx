import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import TeacherDashboard from "@/pages/TeacherDashboard";
import QuestionBank from "@/pages/QuestionBank";
import ClassBattle from "@/pages/ClassBattle";

function RouterComponent() {
  return (
    <Router base="/lantern">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/teacher" component={TeacherDashboard} />
        <Route path="/questions" component={QuestionBank} />
        <Route path="/battle" component={ClassBattle} />
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <RouterComponent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

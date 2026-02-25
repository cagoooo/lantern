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
import { lazy, Suspense } from "react";

const ImmersivePage = lazy(() => import("@/pages/ImmersivePage"));

function RouterComponent() {
  return (
    <Router base="/lantern">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/teacher" component={TeacherDashboard} />
        <Route path="/questions" component={QuestionBank} />
        <Route path="/battle" component={ClassBattle} />
        <Route path="/immersive">
          {() => (
            <Suspense fallback={
              <div className="fixed inset-0 flex items-center justify-center bg-[#050510]">
                <div className="text-center space-y-4">
                  <div className="text-5xl animate-bounce">🏮</div>
                  <p className="text-amber-300 font-medium">正在載入沉浸模式...</p>
                </div>
              </div>
            }>
              <ImmersivePage />
            </Suspense>
          )}
        </Route>
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

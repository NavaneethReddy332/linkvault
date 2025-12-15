import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import Account from "@/pages/account";
import NotFound from "@/pages/not-found";
import { VaultProvider } from "@/lib/store";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/account" component={Account} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <VaultProvider>
        <Router />
        <Toaster />
      </VaultProvider>
    </QueryClientProvider>
  );
}

export default App;

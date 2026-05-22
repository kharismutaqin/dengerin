import { Switch, Route, Router as WouterRouter } from "wouter";
import { ThemeProvider } from "@/context/ThemeContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { Home } from "@/pages/Home";
import { Toaster } from "@/components/ui/toaster";
import { ClickSpark } from "@/components/animate-ui/components/ClickSpark";

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
      Page not found.
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider>
      <PlayerProvider>
        {/* ClickSpark membungkus Router agar efek bisa muncul di mana saja */}
        <ClickSpark
          sparkColor="#a855f7"
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </ClickSpark>
        <Toaster />
      </PlayerProvider>
    </ThemeProvider>
  );
}

export default App;
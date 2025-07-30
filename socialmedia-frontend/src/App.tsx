import "./App.css";
import LoginPage from "./pages/login-page";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 Minutes
        retry: 3,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="SocialApp ">
        <LoginPage />
      </div>
      <Toaster richColors position="bottom-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;

import { useState, useEffect, useContext } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/providers/AppProvider";
import { DataContext } from "@/Context/AppContext";
import { DataProvider } from "./Context/AppContext";
import { fetchAppConfig } from "@/lib/utils";
import { Layout } from "@/components/layout/Layout";
import { Preloader } from "@/components/common/Preloader";
import Index from "./pages/Index";
import TokenLaunch from "./pages/TokenLaunch";
import Liquidity from "./pages/Liquidity";
import TokenInfoPage from "./pages/TokenInfo";
import TokenSnapshotPage from "./pages/TokenSnapshot";
import NotFound from "./pages/NotFound";

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const context = useContext(DataContext);
  if (!context) throw new Error("DataContext not found");
  const { setApiData } = context;

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetchAppConfig();
        if (!response) {
          throw new Error("Failed to fetch API config");
        } 
        setApiData(response);
        setLoading(false);
      } catch (error: any) {
        console.error(error);
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <>
      <Preloader isLoading={loading} error={initError} />
      {!loading && !initError && (
        <Layout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/launch" element={<TokenLaunch />} />
            <Route path="/liquidity" element={<Liquidity />} />
            <Route path="/token-info" element={<TokenInfoPage />} />
            <Route path="/snapshot" element={<TokenSnapshotPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}

const App = () => (
  <DataProvider>
    <AppProvider>
      <TooltipProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </DataProvider>
);

export default App;

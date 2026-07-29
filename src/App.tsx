import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { WalletProvider } from "@/context/WalletContext";
import { TournamentProvider } from "@/context/TournamentContext";
import { AdminProvider } from "@/context/AdminContext";
import { AppRoutes } from "@/routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WalletProvider>
          <TournamentProvider>
            <AdminProvider>
              <AppRoutes />
            </AdminProvider>
          </TournamentProvider>
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

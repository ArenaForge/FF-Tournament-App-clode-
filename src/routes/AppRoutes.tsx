import { Navigate, Route, Routes } from "react-router-dom";
import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { GuestRoute } from "@/routes/GuestRoute";
import { AdminRoute } from "@/routes/AdminRoute";

// Phase 2 — main app UI (frontend only, no Firebase/backend wiring yet)
import Splash from "@/pages/app/Splash";
import Home from "@/pages/app/Home";
import TournamentList from "@/pages/app/TournamentList";
import TournamentDetails from "@/pages/app/TournamentDetails";
import WalletPage from "@/pages/app/Wallet";
import Profile from "@/pages/app/Profile";
import MatchHistory from "@/pages/app/MatchHistory";
import WinnerHistory from "@/pages/app/WinnerHistory";
import Leaderboard from "@/pages/app/Leaderboard";
import Referral from "@/pages/app/Referral";
import DailyRewards from "@/pages/app/DailyRewards";
import Notifications from "@/pages/app/Notifications";
import Rules from "@/pages/app/Rules";
import FAQ from "@/pages/app/FAQ";
import Support from "@/pages/app/Support";

// Phase 4 — wallet & manual UPI payment system
import AddMoney from "@/pages/app/AddMoney";
import WithdrawRequest from "@/pages/app/WithdrawRequest";
import TournamentPayment from "@/pages/app/TournamentPayment";

// Phase 5 — Admin Panel
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageTournaments from "@/pages/admin/ManageTournaments";
import TournamentForm from "@/pages/admin/TournamentForm";
import RoomManagement from "@/pages/admin/RoomManagement";
import PaymentVerification from "@/pages/admin/PaymentVerification";
import WithdrawalManagement from "@/pages/admin/WithdrawalManagement";
import UserManagement from "@/pages/admin/UserManagement";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminSettings from "@/pages/admin/AdminSettings";

export function AppRoutes() {
  return (
    <Routes>
      {/* --- Authentication (Phase 1 — unchanged) --- */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <Signup />
          </GuestRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        }
      />

      {/* --- Phase 2 — main app UI (protected by the existing auth gate) --- */}
      <Route path="/" element={<Splash />} />

      <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/tournaments" element={<ProtectedRoute><TournamentList /></ProtectedRoute>} />
      <Route path="/tournaments/:id" element={<ProtectedRoute><TournamentDetails /></ProtectedRoute>} />
      <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/matches" element={<ProtectedRoute><MatchHistory /></ProtectedRoute>} />
      <Route path="/winners" element={<ProtectedRoute><WinnerHistory /></ProtectedRoute>} />
      <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
      <Route path="/referral" element={<ProtectedRoute><Referral /></ProtectedRoute>} />
      <Route path="/rewards" element={<ProtectedRoute><DailyRewards /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/rules" element={<ProtectedRoute><Rules /></ProtectedRoute>} />
      <Route path="/faq" element={<ProtectedRoute><FAQ /></ProtectedRoute>} />
      <Route path="/support" element={<ProtectedRoute><Support /></ProtectedRoute>} />

      {/* --- Phase 4 — wallet & manual UPI payment system --- */}
      <Route path="/wallet/add-money" element={<ProtectedRoute><AddMoney /></ProtectedRoute>} />
      <Route path="/wallet/withdraw" element={<ProtectedRoute><WithdrawRequest /></ProtectedRoute>} />
      <Route path="/tournaments/:id/pay" element={<ProtectedRoute><TournamentPayment /></ProtectedRoute>} />

      {/* --- Phase 5 — Admin Panel (Phase 6A: now role-gated, admin only) --- */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/tournaments" element={<AdminRoute><ManageTournaments /></AdminRoute>} />
      <Route path="/admin/tournaments/new" element={<AdminRoute><TournamentForm /></AdminRoute>} />
      <Route path="/admin/tournaments/:id/edit" element={<AdminRoute><TournamentForm /></AdminRoute>} />
      <Route path="/admin/tournaments/:id/room" element={<AdminRoute><RoomManagement /></AdminRoute>} />
      <Route path="/admin/payments" element={<AdminRoute><PaymentVerification /></AdminRoute>} />
      <Route path="/admin/withdrawals" element={<AdminRoute><WithdrawalManagement /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
      <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
      <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

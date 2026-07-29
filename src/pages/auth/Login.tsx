import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/common/FormField";
import { DeployButton } from "@/components/common/DeployButton";
import { AlertBanner } from "@/components/common/AlertBanner";
import { useAuth } from "@/context/AuthContext";
import { getAuthErrorMessage } from "@/utils/authErrors";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const redirectTo = (location.state as { from?: string })?.from ?? "/";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Enter both email and password to continue.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setFormError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Player Access"
      title="Log in"
      subtitle="Enter your credentials to rejoin the arena."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {formError && <AlertBanner variant="error" message={formError} />}

        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <div className="flex flex-col gap-1.5">
          <FormField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Link to="/forgot-password" className="link-amber text-sm self-end">
            Forgot password?
          </Link>
        </div>

        <DeployButton type="submit" loading={loading} loadingText="Logging in...">
          Log In
        </DeployButton>

        <p className="text-sm text-ink-muted text-center">
          New to the arena?{" "}
          <Link to="/signup" className="link-amber">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

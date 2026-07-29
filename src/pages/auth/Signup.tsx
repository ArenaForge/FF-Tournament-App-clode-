import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/common/FormField";
import { DeployButton } from "@/components/common/DeployButton";
import { AlertBanner } from "@/components/common/AlertBanner";
import { useAuth } from "@/context/AuthContext";
import { getAuthErrorMessage } from "@/utils/authErrors";

interface FieldErrors {
  displayName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const errors: FieldErrors = {};

    if (displayName.trim().length < 3) {
      errors.displayName = "In-game name must be at least 3 characters.";
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = "Enter a valid email address.";
    }
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = "Passwords don't match.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!validate()) return;

    setLoading(true);
    try {
      await signup(displayName.trim(), email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setFormError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="New Recruit"
      title="Create account"
      subtitle="Set up your callsign and join the roster."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {formError && <AlertBanner variant="error" message={formError} />}

        <FormField
          label="In-Game Name"
          type="text"
          autoComplete="nickname"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="YourCallsign"
          error={fieldErrors.displayName}
        />

        <FormField
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          error={fieldErrors.email}
        />

        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          error={fieldErrors.password}
        />

        <FormField
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter password"
          error={fieldErrors.confirmPassword}
        />

        <DeployButton type="submit" loading={loading} loadingText="Creating account...">
          Create Account
        </DeployButton>

        <p className="text-sm text-ink-muted text-center">
          Already enlisted?{" "}
          <Link to="/login" className="link-amber">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

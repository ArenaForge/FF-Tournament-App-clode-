import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { FormField } from "@/components/common/FormField";
import { DeployButton } from "@/components/common/DeployButton";
import { AlertBanner } from "@/components/common/AlertBanner";
import { useAuth } from "@/context/AuthContext";
import { getAuthErrorMessage } from "@/utils/authErrors";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFormError("Enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err) {
      setFormError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Access Recovery"
      title="Reset password"
      subtitle="We'll send a reset link to your email."
    >
      {sent ? (
        <div className="flex flex-col gap-5">
          <AlertBanner
            variant="success"
            message={`Reset link sent to ${email}. Check your inbox to continue.`}
          />
          <Link to="/login" className="btn-ghost text-center">
            Back to Log In
          </Link>
        </div>
      ) : (
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

          <DeployButton type="submit" loading={loading} loadingText="Sending link...">
            Send Reset Link
          </DeployButton>

          <p className="text-sm text-ink-muted text-center">
            Remembered it?{" "}
            <Link to="/login" className="link-amber">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

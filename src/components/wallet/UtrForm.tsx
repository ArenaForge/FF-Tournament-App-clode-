import { useState, type FormEvent } from "react";
import { FormField } from "@/components/common/FormField";
import { AlertBanner } from "@/components/common/AlertBanner";

interface UtrFormProps {
  onSubmit: (utr: string) => void;
  submitting?: boolean;
}

export function UtrForm({ onSubmit, submitting }: UtrFormProps) {
  const [utr, setUtr] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = utr.trim();
    if (trimmed.length < 6) {
      setError("Enter a valid UTR / Transaction ID from your UPI app.");
      return;
    }
    setError("");
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <AlertBanner variant="error" message={error} />}
      <FormField
        label="UTR / Transaction ID"
        value={utr}
        onChange={(e) => setUtr(e.target.value)}
        placeholder="e.g. 402812345678"
        inputMode="numeric"
      />
      <p className="text-xs text-ink-muted -mt-2">
        Find this in your UPI app's payment history right after paying.
      </p>
      <button type="submit" className="btn-orange" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit for Verification"}
      </button>
    </form>
  );
}

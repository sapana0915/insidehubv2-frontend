import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth";
import { errorMessage } from "../api/client";
import { BoardingPass } from "../components/layout/BoardingPass";
import { PasswordInput, FormError } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Pick a password with at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(token, password);
      navigate("/login", { replace: true });
    } catch (err) {
      setError(errorMessage(err, "This reset link is invalid or expired."));
      setSubmitting(false);
    }
  }

  return (
    <BoardingPass
      from="MAIL"
      to="HUB"
      title="Choose a new password."
      subtitle="This link works once."
      footer={
        <Link to="/login" className="text-terracotta underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {!token ? (
        <p className="text-ink-soft">
          This reset link is missing its token. Request a new one from the sign-in page.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <FormError message={error} />
          <PasswordInput
            label="New password"
            name="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <PasswordInput
            label="Confirm password"
            name="confirm"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" size="lg" loading={submitting} className="w-full">
            Update password
          </Button>
        </form>
      )}
    </BoardingPass>
  );
}

import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth";
import { errorMessage } from "../api/client";
import { BoardingPass } from "../components/layout/BoardingPass";
import { Input, FormError } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(errorMessage(err, "Couldn't send the reset link."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <BoardingPass
      from="HUB"
      to="MAIL"
      title="Forgot your password?"
      subtitle="We'll send a link to the address on your passport."
      footer={
        <Link to="/login" className="text-terracotta underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <p className="text-ink-soft">
          If an account exists for that email, a reset link is on its way. It expires in 30 minutes.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-6">
          <FormError message={error} />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" size="lg" loading={submitting} className="w-full">
            Send reset link
          </Button>
        </form>
      )}
    </BoardingPass>
  );
}

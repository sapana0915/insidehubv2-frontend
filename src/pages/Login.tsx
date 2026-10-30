import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import { BoardingPass } from "../components/layout/BoardingPass";
import { Input, FormError } from "../components/ui/Field";
import { Button } from "../components/ui/Button";

export function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/explore";
}

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && !submitting) return <Navigate to={next} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't sign you in."));
      setSubmitting(false);
    }
  }

  return (
    <BoardingPass
      from="HOME"
      to="HUB"
      title="Welcome back, traveller."
      subtitle="Show your passport to get back to your journal."
      footer={
        <>
          New here?{" "}
          <Link to={`/register${params.get("next") ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-terracotta underline-offset-4 hover:underline">
            Get your passport
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <FormError message={error} />
        <Input label="Email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Board now
        </Button>
      </form>
    </BoardingPass>
  );
}

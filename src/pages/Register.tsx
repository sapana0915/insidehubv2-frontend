import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import { BoardingPass } from "../components/layout/BoardingPass";
import { Input, FormError } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { safeNext } from "./Login";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next") ?? "/new");

  const [form, setForm] = useState({ full_name: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && !submitting) return <Navigate to={next} replace />;

  const update = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError("Pick a password with at least 8 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(form.username)) {
      setError("Usernames are 3–30 letters, numbers, dots or underscores.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        full_name: form.full_name.trim() || undefined,
      });
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't create your account."));
      setSubmitting(false);
    }
  }

  return (
    <BoardingPass
      from="HERE"
      to="EVERYWHERE"
      title="Issue your passport."
      subtitle="One account to post stories, photos and field notes."
      footer={
        <>
          Already have one?{" "}
          <Link to="/login" className="text-terracotta underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormError message={error} />
        </div>
        <Input label="Full name" name="full_name" autoComplete="name" value={form.full_name} onChange={update("full_name")} placeholder="Optional" />
        <Input label="Username" name="username" autoComplete="username" required value={form.username} onChange={update("username")} />
        <Input label="Email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} className="sm:col-span-2" />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={form.password}
          onChange={update("password")}
          hint="At least 8 characters"
          className="sm:col-span-2"
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full sm:col-span-2">
          Stamp my passport
        </Button>
      </form>
    </BoardingPass>
  );
}

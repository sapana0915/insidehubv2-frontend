import { useEffect, useRef, useState, type ChangeEvent, type ClipboardEvent, type FormEvent, type KeyboardEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import { BoardingPass } from "../components/layout/BoardingPass";
import { Input, PasswordInput, FormError } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { safeNext } from "./Login";

const CODE_LENGTH = 6;

export default function Register() {
  const { register, sendSignupCode, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next") ?? "/new");

  const [step, setStep] = useState<"details" | "code">("details");
  const [form, setForm] = useState({ full_name: "", username: "", email: "", password: "", confirm: "" });
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const boxes = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  if (isAuthenticated && !submitting) return <Navigate to={next} replace />;

  const update = (key: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const passwordsMatch = form.password.length > 0 && form.password === form.confirm;
  const confirmHint =
    form.confirm.length === 0 ? undefined : passwordsMatch ? "Passwords match" : "Passwords don't match";

  function validateDetails(): string | null {
    if (!/^[a-zA-Z0-9_.]{3,30}$/.test(form.username)) {
      return "Usernames are 3–30 letters, numbers, dots or underscores.";
    }
    if (form.password.length < 8) return "Pick a password with at least 8 characters.";
    if (!passwordsMatch) return "The two passwords don't match.";
    return null;
  }

  async function sendCode() {
    const problem = validateDetails();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const wait = await sendSignupCode(form.email, form.username);
      setCooldown(wait);
      setDigits(Array(CODE_LENGTH).fill(""));
      setStep("code");
      window.setTimeout(() => boxes.current[0]?.focus(), 50);
    } catch (err) {
      setError(errorMessage(err, "Couldn't send the code."));
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCode(code: string) {
    setError(null);
    setSubmitting(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        full_name: form.full_name.trim() || undefined,
        code,
      });
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't create your account."));
      setSubmitting(false);
    }
  }

  function onDetails(e: FormEvent) {
    e.preventDefault();
    void sendCode();
  }

  function onDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = digits.map((d, i) => (i === index ? digit : d));
    setDigits(nextDigits);
    if (digit && index < CODE_LENGTH - 1) boxes.current[index + 1]?.focus();
    if (nextDigits.every((d) => d) && !submitting) void submitCode(nextDigits.join(""));
  }

  function onDigitKey(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) boxes.current[index - 1]?.focus();
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const nextDigits = Array(CODE_LENGTH)
      .fill("")
      .map((_, i) => pasted[i] ?? "");
    setDigits(nextDigits);
    boxes.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    if (pasted.length === CODE_LENGTH) void submitCode(pasted);
  }

  return (
    <BoardingPass
      from="HERE"
      to="EVERYWHERE"
      title={step === "details" ? "Issue your passport." : "Check your inbox."}
      subtitle={
        step === "details"
          ? "One account to post stories, photos and field notes."
          : `We sent a 6-digit code to ${form.email}.`
      }
      footer={
        <>
          Already have one?{" "}
          <Link to="/login" className="text-terracotta underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      {step === "details" ? (
        <form onSubmit={onDetails} className="grid gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormError message={error} />
          </div>
          <Input label="Full name" name="full_name" autoComplete="name" value={form.full_name} onChange={update("full_name")} placeholder="Optional" />
          <Input label="Username" name="username" autoComplete="username" required value={form.username} onChange={update("username")} />
          <Input label="Email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update("email")} className="sm:col-span-2" />
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={update("password")}
            hint="At least 8 characters"
          />
          <PasswordInput
            label="Confirm password"
            name="confirm"
            autoComplete="new-password"
            required
            value={form.confirm}
            onChange={update("confirm")}
            hint={confirmHint}
            error={form.confirm && !passwordsMatch ? "Passwords don't match" : undefined}
          />
          <Button type="submit" size="lg" loading={submitting} className="w-full sm:col-span-2">
            Send verification code
          </Button>
        </form>
      ) : (
        <div>
          <FormError message={error} />
          <div className="mt-2 flex justify-between gap-2" onPaste={onPaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  boxes.current[i] = el;
                }}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                aria-label={`Digit ${i + 1}`}
                onChange={(e) => onDigit(i, e.target.value)}
                onKeyDown={(e) => onDigitKey(i, e)}
                className="h-14 w-full border-b-2 border-ink/30 bg-transparent text-center font-mono text-2xl focus:border-terracotta focus:outline-none"
              />
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="eyebrow hover:text-terracotta" onClick={() => setStep("details")}>
              Change details
            </button>
            <button
              type="button"
              className="eyebrow hover:text-terracotta disabled:opacity-50"
              disabled={cooldown > 0 || submitting}
              onClick={() => void sendCode()}
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
          <Button
            className="mt-6 w-full"
            size="lg"
            loading={submitting}
            disabled={digits.some((d) => !d)}
            onClick={() => void submitCode(digits.join(""))}
          >
            Stamp my passport
          </Button>
        </div>
      )}
    </BoardingPass>
  );
}

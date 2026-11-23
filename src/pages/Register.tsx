import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../api/client";
import { BoardingPass } from "../components/layout/BoardingPass";
import { Input, PasswordInput, FormError } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { safeNext } from "./Login";

// OTP disabled for now — uncomment when email verification is required again:
// const CODE_LENGTH = 6;

export default function Register() {
  // OTP: restore sendSignupCode from useAuth when re-enabling
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next") ?? "/new");

  const [form, setForm] = useState({ full_name: "", username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // OTP disabled for now:
  // const [step, setStep] = useState<"details" | "code">("details");
  // const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  // const [cooldown, setCooldown] = useState(0);
  // const boxes = useRef<Array<HTMLInputElement | null>>([]);
  // useEffect(() => {
  //   if (cooldown <= 0) return;
  //   const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000);
  //   return () => window.clearTimeout(timer);
  // }, [cooldown]);

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

  async function submitRegister() {
    const problem = validateDetails();
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        full_name: form.full_name.trim() || undefined,
        // code,  // OTP disabled for now
      });
      navigate(next, { replace: true });
    } catch (err) {
      setError(errorMessage(err, "Couldn't create your account."));
      setSubmitting(false);
    }
  }

  function onDetails(e: FormEvent) {
    e.preventDefault();
    void submitRegister();
  }

  // OTP disabled for now — uncomment when email verification is required again:
  // async function sendCode() {
  //   const problem = validateDetails();
  //   if (problem) {
  //     setError(problem);
  //     return;
  //   }
  //   setError(null);
  //   setSubmitting(true);
  //   try {
  //     const wait = await sendSignupCode(form.email, form.username);
  //     setCooldown(wait);
  //     setDigits(Array(CODE_LENGTH).fill(""));
  //     setStep("code");
  //     window.setTimeout(() => boxes.current[0]?.focus(), 50);
  //   } catch (err) {
  //     setError(errorMessage(err, "Couldn't send the code."));
  //   } finally {
  //     setSubmitting(false);
  //   }
  // }
  //
  // async function submitCode(code: string) {
  //   setError(null);
  //   setSubmitting(true);
  //   try {
  //     await register({
  //       email: form.email,
  //       username: form.username,
  //       password: form.password,
  //       full_name: form.full_name.trim() || undefined,
  //       code,
  //     });
  //     navigate(next, { replace: true });
  //   } catch (err) {
  //     setError(errorMessage(err, "Couldn't create your account."));
  //     setSubmitting(false);
  //   }
  // }
  //
  // function onDigit(index: number, value: string) { ... }
  // function onDigitKey(index: number, e: KeyboardEvent<HTMLInputElement>) { ... }
  // function onPaste(e: ClipboardEvent<HTMLInputElement>) { ... }

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
          Create account
        </Button>
      </form>

      {/* OTP step UI — uncomment when email verification is required again:
      {step === "code" && (
        <div>
          <FormError message={error} />
          <div className="mt-2 flex justify-between gap-2" onPaste={onPaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { boxes.current[i] = el; }}
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
          ...
        </div>
      )}
      */}
    </BoardingPass>
  );
}

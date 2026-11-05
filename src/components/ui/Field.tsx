import { useState, forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
}

const inputClass =
  "w-full bg-transparent border-0 border-b-2 border-ink/25 px-0 py-2 text-ink placeholder:text-ink-faint focus:border-terracotta focus:outline-none focus-visible:outline-none transition-colors";

export const Input = forwardRef<HTMLInputElement, FieldProps & InputHTMLAttributes<HTMLInputElement>>(function Input(
  { label, hint, error, id, className = "", ...rest },
  ref,
) {
  const fieldId = id ?? rest.name;
  return (
    <label htmlFor={fieldId} className={`block ${className}`}>
      <span className="eyebrow">{label}</span>
      <input ref={ref} id={fieldId} className={inputClass} aria-invalid={Boolean(error)} {...rest} />
      {error ? (
        <span className="mt-1 block text-xs text-terracotta-deep">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
});

export function PasswordInput({
  label,
  hint,
  error,
  id,
  className = "",
  ...rest
}: FieldProps & Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const fieldId = id ?? rest.name;
  return (
    <label htmlFor={fieldId} className={`block ${className}`}>
      <span className="eyebrow">{label}</span>
      <span className="relative block">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={`${inputClass} pr-9`}
          aria-invalid={Boolean(error)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-ink-soft hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
      {error ? (
        <span className="mt-1 block text-xs text-terracotta-deep">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
      ) : null}
    </label>
  );
}

export const Textarea = forwardRef<HTMLTextAreaElement, FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ label, hint, error, id, className = "", ...rest }, ref) {
    const fieldId = id ?? rest.name;
    return (
      <label htmlFor={fieldId} className={`block ${className}`}>
        <span className="eyebrow">{label}</span>
        <textarea
          ref={ref}
          id={fieldId}
          className="lined-paper mt-2 w-full resize-y border border-ink/15 px-5 py-0 font-display text-lg text-ink placeholder:text-ink-faint focus:border-terracotta focus:outline-none"
          aria-invalid={Boolean(error)}
          {...rest}
        />
        {error ? (
          <span className="mt-1 block text-xs text-terracotta-deep">{error}</span>
        ) : hint ? (
          <span className="mt-1 block text-xs text-ink-faint">{hint}</span>
        ) : null}
      </label>
    );
  },
);

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="border-l-4 border-terracotta bg-terracotta/10 px-4 py-3 text-sm text-terracotta-deep">
      {message}
    </div>
  );
}

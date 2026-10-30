import { ButtonLink } from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
      <p className="font-mono text-[7rem] font-semibold leading-none text-terracotta/80">404</p>
      <p className="mt-2 font-hand text-3xl text-ocean">return to sender</p>
      <h1 className="mt-4 font-display text-4xl font-semibold">This page isn't on any map.</h1>
      <p className="mt-3 text-ink-soft">The address might be mistyped, or the page has moved on to its next destination.</p>
      <ButtonLink to="/" className="mt-8">
        Head home
      </ButtonLink>
    </div>
  );
}

import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { LogOut, Menu, PenLine, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES } from "../../lib/categories";
import { ButtonLink } from "../ui/Button";

const today = new Date().toLocaleDateString("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const navCategories = CATEGORIES.slice(0, 6);

export function Masthead() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="hidden items-center justify-between border-b border-ink/10 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-soft md:flex">
          <span>Vol. 01 · Est. 2026</span>
          <span>{today}</span>
          <span>Blogs · Photos · Travel Stories</span>
        </div>

        <div className="flex items-center justify-between gap-4 py-3">
          <Link to="/" className="group flex items-baseline gap-2" onClick={() => setOpen(false)}>
            <span className="font-display text-3xl font-semibold italic tracking-tight text-ink md:text-4xl">
              Inside<span className="text-terracotta">Hub</span>
            </span>
            <span className="hidden font-hand text-xl text-ocean sm:inline">field journal</span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main">
            <NavLink
              to="/explore"
              className={({ isActive }) => `eyebrow hover:text-terracotta ${isActive ? "!text-terracotta" : ""}`}
            >
              Explore
            </NavLink>
            {navCategories.map((c) => (
              <NavLink
                key={c.slug}
                to={`/c/${c.slug}`}
                className={({ isActive }) => `eyebrow hover:text-terracotta ${isActive ? "!text-terracotta" : ""}`}
              >
                {c.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <ButtonLink to="/new" size="sm" icon={<PenLine className="h-3.5 w-3.5" />}>
                  Write
                </ButtonLink>
                <Link
                  to="/me"
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-mustard font-display font-semibold text-ink"
                  title="Your journal"
                >
                  {(user?.full_name || user?.username || "?").charAt(0).toUpperCase()}
                </Link>
                <button onClick={handleLogout} className="text-ink-soft hover:text-terracotta" aria-label="Log out" title="Log out">
                  <LogOut className="h-4 w-4" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="eyebrow hover:text-terracotta">
                  Sign in
                </Link>
                <ButtonLink to="/register" size="sm" variant="ink">
                  Get your passport
                </ButtonLink>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      <div className="double-rule" />

      {open ? (
        <div className="border-b border-ink/10 bg-paper px-4 pb-6 pt-2 md:hidden">
          <div className="flex flex-col gap-3">
            <Link to="/explore" className="eyebrow" onClick={() => setOpen(false)}>
              Explore all
            </Link>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} to={`/c/${c.slug}`} className="eyebrow" onClick={() => setOpen(false)}>
                {c.name}
              </Link>
            ))}
            <hr className="border-ink/10" />
            {isAuthenticated ? (
              <>
                <Link to="/new" className="eyebrow text-terracotta" onClick={() => setOpen(false)}>
                  Write a new entry
                </Link>
                <Link to="/me" className="eyebrow" onClick={() => setOpen(false)}>
                  Your journal
                </Link>
                <button onClick={handleLogout} className="eyebrow text-left">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="eyebrow" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
                <Link to="/register" className="eyebrow text-terracotta" onClick={() => setOpen(false)}>
                  Get your passport
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}

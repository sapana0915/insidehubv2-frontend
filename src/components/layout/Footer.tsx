import { Link } from "react-router-dom";
import { CATEGORIES } from "../../lib/categories";
import { TornDivider } from "../ui/Decor";

export function Footer() {
  return (
    <footer className="mt-24">
      <TornDivider />
      <div className="bg-paper-deep">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl font-semibold italic">
              Inside<span className="text-terracotta">Hub</span>
            </p>
            <p className="mt-3 max-w-sm text-sm text-ink-soft">
              A shared field journal for the places we go, the food we find and the frames we keep. Pack light, write
              often.
            </p>
            <p className="mt-6 font-hand text-2xl text-ocean">wish you were here ✶</p>
          </div>
          <div>
            <p className="eyebrow">Drawers</p>
            <ul className="mt-3 space-y-2 text-sm">
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/c/${c.slug}`} className="hover:text-terracotta">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Journal</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/explore" className="hover:text-terracotta">
                  Explore
                </Link>
              </li>
              <li>
                <Link to="/new" className="hover:text-terracotta">
                  Write an entry
                </Link>
              </li>
              <li>
                <Link to="/me" className="hover:text-terracotta">
                  Your journal
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ink/10 py-4 text-center font-mono text-[0.62rem] uppercase tracking-[0.22em] text-ink-faint">
          © {new Date().getFullYear()} InsideHub · Printed on recycled pixels
        </div>
      </div>
    </footer>
  );
}

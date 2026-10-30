import type { CSSProperties } from "react";
import { NavLink } from "react-router-dom";
import { CATEGORIES } from "../../lib/categories";

export function CategoryRail() {
  return (
    <nav aria-label="Categories" className="-mx-4 overflow-x-auto px-4 pb-3">
      <ul className="flex min-w-max gap-3 py-2">
        <li>
          <NavLink
            to="/explore"
            end
            className={({ isActive }) =>
              `stamp transition ${isActive ? "-rotate-2 scale-105" : "opacity-70 hover:opacity-100"}`
            }
            style={{ "--stamp-color": "var(--color-ink)" } as CSSProperties}
          >
            All entries
          </NavLink>
        </li>
        {CATEGORIES.map((c, i) => {
          const Icon = c.icon;
          return (
            <li key={c.slug}>
              <NavLink
                to={`/c/${c.slug}`}
                className={({ isActive }) =>
                  `stamp transition ${isActive ? "scale-105" : "opacity-70 hover:opacity-100"} ${i % 2 ? "rotate-1" : "-rotate-1"}`
                }
                style={{ "--stamp-color": c.color } as CSSProperties}
              >
                <Icon className="h-3 w-3" />
                {c.name}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

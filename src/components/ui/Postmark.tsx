import { postmarkDate } from "../../lib/format";

interface PostmarkProps {
  date: string;
  label?: string;
  size?: number;
  className?: string;
}

/** Circular ink cancellation mark with wavy lines, used as the date stamp on posts. */
export function Postmark({ date, label = "INSIDEHUB · FIELD POST", size = 88, className = "" }: PostmarkProps) {
  const { day, month, year } = postmarkDate(date);
  const id = `pm-${date.replace(/[^0-9]/g, "").slice(0, 14)}-${size}`;
  return (
    <svg
      width={size * 1.9}
      height={size}
      viewBox="0 0 190 100"
      className={`pointer-events-none text-ocean/80 ${className}`}
      aria-label={`Posted ${day} ${month} ${year}`}
      role="img"
    >
      <defs>
        <path id={id} d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
      </defs>
      <g fill="none" stroke="currentColor">
        <circle cx="50" cy="50" r="46" strokeWidth="2.5" />
        <circle cx="50" cy="50" r="28" strokeWidth="1.2" />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M100 ${26 + i * 12} q 11 -6 22 0 t 22 0 t 22 0 t 22 0`}
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </g>
      <text fill="currentColor" fontFamily="JetBrains Mono, monospace" fontSize="8.5" letterSpacing="1.6">
        <textPath href={`#${id}`} startOffset="2%">
          {label}
        </textPath>
      </text>
      <text x="50" y="46" textAnchor="middle" fill="currentColor" fontFamily="Fraunces Variable, serif" fontSize="17" fontWeight="600">
        {day}
      </text>
      <text x="50" y="60" textAnchor="middle" fill="currentColor" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="1.5">
        {month} {year.slice(2)}
      </text>
    </svg>
  );
}

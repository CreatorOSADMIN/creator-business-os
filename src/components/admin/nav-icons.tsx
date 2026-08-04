type IconProps = { className?: string };

const base = "h-[18px] w-[18px]";

export function DashboardIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.5" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.5" />
    </svg>
  );
}

export function CreatorsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 19.5c0-3.31 2.46-5.5 5.5-5.5s5.5 2.19 5.5 5.5" />
      <path d="M16 8.25a2.75 2.75 0 1 1 0 5.4" />
      <path d="M18.5 14.6c2.1.55 3 2.2 3 4.9" />
    </svg>
  );
}

export function AnalyticsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <path d="M4 20V10" />
      <path d="M11 20V4" />
      <path d="M18 20v-7" />
      <path d="M3 20.5h18" />
    </svg>
  );
}

export function AnnouncementsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <path d="M3.5 10.5v3a1.5 1.5 0 0 0 1.5 1.5h1.2l.9 4.2a1.2 1.2 0 0 0 2.35-.5l-.7-3.7" />
      <path d="M6.2 10.5 15.5 6v13l-9.3-4.5Z" />
      <path d="M18.5 9.25a3.25 3.25 0 0 1 0 5.5" />
    </svg>
  );
}

export function QuestionsIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <path d="M12 16.5v.01" />
      <path d="M9.5 9.25a2.5 2.5 0 1 1 3.7 2.2c-.85.5-1.2 1-1.2 1.8v.25" />
      <rect x="3.5" y="3.5" width="17" height="14" rx="2.5" />
      <path d="M8 21.5 12 17.5" />
    </svg>
  );
}

export function MenuIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className={`${base} ${className}`}>
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

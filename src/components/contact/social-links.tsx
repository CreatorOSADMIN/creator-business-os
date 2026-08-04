type SocialLink = {
  name: string;
  href: string;
  icon: (props: { className?: string }) => React.ReactElement;
};

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true as const,
};

const socialLinks: SocialLink[] = [
  {
    name: "Instagram",
    href: "https://instagram.com/creatoros",
    icon: ({ className }) => (
      <svg {...ICON_PROPS} className={className}>
        <path d="M12 2c-2.72 0-3.06.01-4.12.06-1.06.05-1.79.22-2.43.47-.66.26-1.22.6-1.78 1.16A4.9 4.9 0 0 0 2.5 5.47c-.25.64-.42 1.37-.47 2.43C1.98 8.96 1.97 9.3 1.97 12s.01 3.04.06 4.1c.05 1.06.22 1.79.47 2.43.26.66.6 1.22 1.16 1.78.56.56 1.12.9 1.78 1.16.64.25 1.37.42 2.43.47 1.06.05 1.4.06 4.12.06s3.06-.01 4.12-.06c1.06-.05 1.79-.22 2.43-.47a4.9 4.9 0 0 0 1.78-1.16 4.9 4.9 0 0 0 1.16-1.78c.25-.64.42-1.37.47-2.43.05-1.06.06-1.4.06-4.1s-.01-3.04-.06-4.1c-.05-1.06-.22-1.79-.47-2.43a4.9 4.9 0 0 0-1.16-1.78A4.9 4.9 0 0 0 18.55.53c-.64-.25-1.37-.42-2.43-.47C15.06.01 14.72 0 12 0zm0 1.98c2.67 0 2.99.01 4.04.06.98.04 1.5.2 1.86.34.47.18.8.4 1.15.75.35.35.57.68.75 1.15.14.36.3.88.34 1.86.05 1.05.06 1.37.06 4.04s-.01 2.99-.06 4.04c-.04.98-.2 1.5-.34 1.86-.18.47-.4.8-.75 1.15-.35.35-.68.57-1.15.75-.36.14-.88.3-1.86.34-1.05.05-1.37.06-4.04.06s-2.99-.01-4.04-.06c-.98-.04-1.5-.2-1.86-.34a3.1 3.1 0 0 1-1.15-.75 3.1 3.1 0 0 1-.75-1.15c-.14-.36-.3-.88-.34-1.86C3.8 14.99 3.79 14.67 3.79 12s.01-2.99.06-4.04c.04-.98.2-1.5.34-1.86.18-.47.4-.8.75-1.15.35-.35.68-.57 1.15-.75.36-.14.88-.3 1.86-.34C9.01 3.8 9.33 3.79 12 3.79zm0 3.37a4.84 4.84 0 1 0 0 9.68 4.84 4.84 0 0 0 0-9.68zm0 7.98a3.14 3.14 0 1 1 0-6.28 3.14 3.14 0 0 1 0 6.28zm6.16-8.17a1.13 1.13 0 1 1-2.26 0 1.13 1.13 0 0 1 2.26 0z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/company/creatoros",
    icon: ({ className }) => (
      <svg {...ICON_PROPS} className={className}>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.001 2.5 2.5 0 0 1 0-5zM.5 8.98h4.96V23H.5V8.98zM8.98 8.98h4.75v1.92h.07c.66-1.25 2.28-2.57 4.69-2.57 5.02 0 5.95 3.3 5.95 7.6V23h-4.96v-6.32c0-1.51-.03-3.45-2.1-3.45-2.1 0-2.43 1.64-2.43 3.34V23H8.98V8.98z" />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://tiktok.com/@creatoros",
    icon: ({ className }) => (
      <svg {...ICON_PROPS} className={className}>
        <path d="M16.6 0h-3.3v15.5a3.1 3.1 0 1 1-2.19-2.96V9.2a6.4 6.4 0 1 0 5.49 6.33V7.16a8.2 8.2 0 0 0 4.9 1.6V5.44a4.9 4.9 0 0 1-4.9-4.9z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@creatoros",
    icon: ({ className }) => (
      <svg {...ICON_PROPS} className={className}>
        <path d="M23.5 6.5a3.02 3.02 0 0 0-2.12-2.14C19.5 3.83 12 3.83 12 3.83s-7.5 0-9.38.53A3.02 3.02 0 0 0 .5 6.5 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.5 3.02 3.02 0 0 0 2.12 2.14c1.88.53 9.38.53 9.38.53s7.5 0 9.38-.53a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.5zM9.6 15.6V8.4l6.27 3.6z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "https://x.com/creatoros",
    icon: ({ className }) => (
      <svg {...ICON_PROPS} className={className}>
        <path d="M18.24 2h3.34l-7.3 8.35L23 22h-6.72l-5.26-6.87L4.98 22H1.63l7.8-8.92L1 2h6.9l4.76 6.28zm-1.17 18h1.85L7.02 3.9H5.03z" />
      </svg>
    ),
  },
  {
    name: "Reddit",
    href: "https://reddit.com/user/creatoros",
    icon: ({ className }) => (
      <svg {...ICON_PROPS} className={className}>
        <path d="M24 12c0-1.32-1.07-2.4-2.4-2.4-.65 0-1.24.26-1.67.68-1.62-1.1-3.84-1.8-6.3-1.89l1.28-4.03 3.52.83a1.7 1.7 0 1 0 .2-.98l-3.9-.92a.5.5 0 0 0-.59.34l-1.43 4.5c-2.5.07-4.75.77-6.39 1.88a2.38 2.38 0 0 0-1.65-.67C1.07 9.6 0 10.68 0 12c0 .96.55 1.78 1.36 2.18a4.1 4.1 0 0 0-.06.7c0 3.2 3.9 5.8 8.7 5.8s8.7-2.6 8.7-5.8c0-.24-.02-.47-.06-.7A2.4 2.4 0 0 0 24 12zM6 13.2a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm9.15 3.6a5.4 5.4 0 0 1-3.15.95 5.4 5.4 0 0 1-3.15-.95.45.45 0 0 1 .5-.75c.75.5 1.7.75 2.65.75s1.9-.25 2.65-.75a.45.45 0 1 1 .5.75zM16.5 13.2a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
      </svg>
    ),
  },
];

/** Horizontal row of premium, minimal social icon links for the Luxury Tech design system. */
export function SocialLinks() {
  return (
    <nav aria-label="Social media" className="mt-8 flex items-center justify-center gap-4">
      {socialLinks.map(({ name, href, icon: Icon }) => (
        <a
          key={name}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={name}
          title={name}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
        >
          <Icon className="h-[18px] w-[18px]" />
        </a>
      ))}
    </nav>
  );
}

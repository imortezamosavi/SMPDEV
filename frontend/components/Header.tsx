const navItems = [
  {
    label: "Home",
    href: "#",
    icon: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
  },
  {
    label: "About",
    href: "#",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </>
    ),
  },
  {
    label: "How It Works",
    href: "#",
    icon: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </>
    ),
  },
  {
    label: "Contact",
    href: "#",
    icon: (
      <>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </>
    ),
  },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-green-600 bg-green-600 shadow-md">
      <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
            </svg>
          </div>

          <div className="leading-tight text-white">
            <h1 className="text-lg font-semibold">
              Soil Moisture Monitoring Platform
            </h1>

            <p className="text-xs text-green-100">
              Real-Time Satellite-Based Soil Moisture Analysis
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <nav
            className="hidden items-center gap-2 md:flex"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-green-50 transition-all hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/40"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {item.icon}
                </svg>

                {item.label}
              </a>
            ))}
          </nav>

          {/* Avatar */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-semibold text-green-700 transition hover:scale-105 hover:shadow-lg"
            aria-label="User profile"
          >
            JD
          </button>
        </div>
      </div>
    </header>
  );
}
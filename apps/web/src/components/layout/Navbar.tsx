import clsx from 'clsx';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/apartments', label: 'Residences' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const handleClose = () => {
    if (document.activeElement instanceof HTMLElement && document.getElementById('mobile-nav')?.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    setOpen(false);
  };

  // Close drawer on route change and clear active focus inside drawer
  useEffect(() => {
    handleClose();
  }, [location.pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* ── Fixed header bar ── */}
      <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-[#E9E5E0] bg-[#34282D]">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-5">
          {/* Logo */}
          <Link to="/" aria-label="Porchlight – Home" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 overflow-hidden rounded-sm bg-white flex items-center justify-center">
              <img
                src="/logo.png"
                alt=""
                className="h-[140%] w-[140%] object-cover object-[center_18%]"
                style={{ marginTop: '-20%' }}
              />
            </div>
            <span className="font-display text-xs sm:text-sm font-semibold tracking-[0.16em] sm:tracking-[0.18em] text-white">
              PORCHLIGHT
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'text-[13px] font-medium tracking-wide transition-colors',
                    isActive ? 'text-white' : 'text-white/60 hover:text-white',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>



          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            className="flex h-9 w-9 items-center justify-center rounded text-white/80 transition hover:text-white lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={handleClose}
        />
      )}

      {/* ── Mobile drawer panel ── */}
      <nav
        id="mobile-nav"
        aria-label="Mobile navigation"
        inert={!open}
        className={clsx(
          'fixed inset-y-0 right-0 z-50 w-72 bg-[#34282D] lg:hidden flex flex-col',
          'transition-transform duration-250 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Drawer header */}
        <div className="flex h-14 items-center justify-end border-b border-white/10 px-5">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close navigation"
            className="flex h-8 w-8 items-center justify-center rounded text-white/60 transition hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav links */}
        <ul className="flex flex-col px-4 pt-6 pb-4" role="list">
          {links.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={handleClose}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center py-2.5 sm:py-3.5 text-[13.5px] sm:text-base font-medium border-b border-white/8 transition-colors',
                    isActive ? 'text-white' : 'text-white/60 hover:text-white',
                  )
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

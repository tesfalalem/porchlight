import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* pt offsets the fixed floating navbar height (≈64 px pill + 20 px gap) */}
      <main className="flex-1 pt-[88px] sm:pt-[96px]">{<Outlet />}</main>
      <Footer />
    </div>
  );
}

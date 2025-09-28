import Link from 'next/link';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-logo">
      <span className="logo-main">Mentora</span>
      <span className="logo-tag">Rise Low</span>
    </div>
    <ul className="navbar-links">
      <li><Link href="/hub">Hub</Link></li>
      <li><Link href="/tournaments">Torneios</Link></li>
      <li><Link href="/players">Players</Link></li>
    </ul>
  </nav>
);

export default Navbar;

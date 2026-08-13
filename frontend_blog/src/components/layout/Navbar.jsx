import { Link, NavLink } from "react-router-dom";


export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar__container">
        <Link
          to="/"
          className="navbar__brand"
        >
          Portfolio
        </Link>

        <nav className="navbar__links">
          <NavLink to="/">
            Accueil
          </NavLink>

          <NavLink to="/blog">
            Blog
          </NavLink>

          <NavLink to="/admin/login">
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
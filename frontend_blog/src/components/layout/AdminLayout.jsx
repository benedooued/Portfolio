import { NavLink, Outlet } from "react-router-dom";


export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar__title">
          Administration
        </h2>

        <nav className="admin-sidebar__nav">
          <NavLink to="/admin">
            Articles
          </NavLink>

          <NavLink to="/admin/comments">
            Commentaires
          </NavLink>

          <NavLink to="/blog">
            Voir le blog
          </NavLink>
        </nav>
      </aside>

      <section className="admin-content">
        <Outlet />
      </section>
    </div>
  );
}
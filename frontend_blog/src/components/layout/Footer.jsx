export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__container">
        <p>
          © {new Date().getFullYear()} Portfolio.
          Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
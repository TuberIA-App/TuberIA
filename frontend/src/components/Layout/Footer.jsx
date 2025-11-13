import React from 'react';
import Logo from '../common/Logo/Logo';
import './Footer.css';

const Footer = () => {
  const productLinks = [
    { href: "#", text: "Características" },
    { href: "#", text: "Precios" },
    { href: "#", text: "API" },
  ];
  const companyLinks = [
    { href: "#", text: "Sobre nosotros" },
    { href: "#", text: "Blog" },
    { href: "#", text: "Contacto" },
  ];
  const legalLinks = [
    { href: "#", text: "Privacidad" },
    { href: "#", text: "Términos" },
    { href: "#", text: "Cookies" },
  ];

  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Columna de la marca */}
          <div className="footer__brand">
            <Logo to="/" className="footer__brand-link" size="md" />
            <p className="footer__tagline">
              Transforma videos en conocimiento instantáneo con IA.
            </p>
          </div>

          {/* Columnas de enlaces */}
          <nav className="footer__nav" aria-label="Navegación de producto">
            <h4 className="footer__nav-title">Producto</h4>
            <ul className="footer__nav-list">
              {productLinks.map(link => (
                <li key={link.text}><a href={link.href} className="footer__nav-link">{link.text}</a></li>
              ))}
            </ul>
          </nav>
          <nav className="footer__nav" aria-label="Navegación de empresa">
            <h4 className="footer__nav-title">Empresa</h4>
            <ul className="footer__nav-list">
              {companyLinks.map(link => (
                <li key={link.text}><a href={link.href} className="footer__nav-link">{link.text}</a></li>
              ))}
            </ul>
          </nav>
          <nav className="footer__nav" aria-label="Navegación legal">
            <h4 className="footer__nav-title">Legal</h4>
            <ul className="footer__nav-list">
              {legalLinks.map(link => (
                <li key={link.text}><a href={link.href} className="footer__nav-link">{link.text}</a></li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="footer__copyright">
          <p>© {new Date().getFullYear()} TuberIA. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

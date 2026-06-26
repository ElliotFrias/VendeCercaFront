import { Link } from 'react-router-dom';
import { Globe, Mail, MessageCircle } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="navbar-logo">
            <span className="text-gradient">Vende</span>Cerca
          </Link>
          <p className="footer-description">
            Conectando tu negocio con la comunidad. Encuentra lo que necesitas, cerca de ti.
          </p>
          <div className="footer-socials">
            <a href="#" className="social-icon"><Globe size={20} /></a>
            <a href="#" className="social-icon"><Mail size={20} /></a>
            <a href="#" className="social-icon"><MessageCircle size={20} /></a>
          </div>
        </div>
        
        <div className="footer-links-group">
          <h4 className="footer-heading">Plataforma</h4>
          <Link to="/negocios" className="footer-link">Explorar Negocios</Link>
          <Link to="/register" className="footer-link">Registra tu Negocio</Link>
          <Link to="/about" className="footer-link">Sobre Nosotros</Link>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Soporte</h4>
          <Link to="/help" className="footer-link">Centro de Ayuda</Link>
          <Link to="/terms" className="footer-link">Términos de Servicio</Link>
          <Link to="/privacy" className="footer-link">Privacidad</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} VendeCerca. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;

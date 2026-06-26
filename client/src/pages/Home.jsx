import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Star, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container hero-container animate-fade-in">
          <h1 className="hero-title">
            Encuentra lo mejor, <br />
            <span className="text-gradient">cerca de ti.</span>
          </h1>
          <p className="hero-subtitle">
            Descubre negocios locales, productos increíbles y servicios excepcionales en tu comunidad. Apoya el comercio local con VendeCerca.
          </p>
          <div className="hero-actions">
            <Link to="/negocios" className="btn btn-primary btn-lg">
              Explorar Negocios <ArrowRight size={20} className="ml-2" />
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Registra tu Negocio
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features container">
        <h2 className="section-title text-center">¿Por qué usar VendeCerca?</h2>
        <div className="features-grid">
          <Card hoverable className="feature-card text-center">
            <CardContent>
              <div className="feature-icon-wrapper">
                <MapPin size={32} className="feature-icon" />
              </div>
              <h3 className="feature-title">Descubre tu entorno</h3>
              <p className="text-secondary">Encuentra exactamente lo que buscas sin ir muy lejos. Todo está a la vuelta de la esquina.</p>
            </CardContent>
          </Card>
          
          <Card hoverable className="feature-card text-center">
            <CardContent>
              <div className="feature-icon-wrapper">
                <ShoppingBag size={32} className="feature-icon" />
              </div>
              <h3 className="feature-title">Compra con confianza</h3>
              <p className="text-secondary">Conecta directamente con vendedores locales y obtén productos y servicios de calidad.</p>
            </CardContent>
          </Card>

          <Card hoverable className="feature-card text-center">
            <CardContent>
              <div className="feature-icon-wrapper">
                <Star size={32} className="feature-icon" />
              </div>
              <h3 className="feature-title">Apoya lo local</h3>
              <p className="text-secondary">Fomenta la economía de tu comunidad apoyando a emprendedores y negocios cercanos.</p>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box glass-panel text-center">
            <h2>¿Tienes un negocio?</h2>
            <p className="text-secondary mb-6">Únete a VendeCerca y haz que más clientes te encuentren fácilmente.</p>
            <Link to="/register" className="btn btn-primary btn-lg">Crear Cuenta Gratis</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

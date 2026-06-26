import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Revisar si hay un usuario en localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/'; // Forzar recarga para limpiar todo el estado
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="text-gradient">Vende</span>Cerca
        </Link>

        <div className="navbar-search desktop-only">
          <Search className="search-icon" size={18} />
          <input type="text" placeholder="Buscar negocios, productos..." className="search-input" />
        </div>

        <div className="navbar-actions desktop-only">
          <Link to="/negocios" className="nav-link">Explorar</Link>
          
          {user ? (
            <div className="flex items-center gap-4 ml-4">
              <Link to="/dashboard" className="flex items-center gap-2 nav-link font-medium text-primary">
                <User size={18} /> {user.usuNombre}
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm" title="Cerrar Sesión">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Iniciar Sesión</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Registrarse</Link>
            </>
          )}
        </div>

        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mobile-menu animate-fade-in">
          <div className="navbar-search">
            <Search className="search-icon" size={18} />
            <input type="text" placeholder="Buscar..." className="search-input" />
          </div>
          <Link to="/negocios" className="nav-link" onClick={() => setIsMenuOpen(false)}>Explorar</Link>
          
          <div className="mobile-menu-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="btn btn-secondary w-full flex items-center justify-center gap-2 mb-2" onClick={() => setIsMenuOpen(false)}>
                  <User size={18} /> Mi Perfil
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-md w-full text-danger">
                  <LogOut size={18} className="mr-2 inline" /> Cerrar Sesión
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-md w-full mb-2" onClick={() => setIsMenuOpen(false)}>Iniciar Sesión</Link>
                <Link to="/register" className="btn btn-primary btn-md w-full" onClick={() => setIsMenuOpen(false)}>Registrarse</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

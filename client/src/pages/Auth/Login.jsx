import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import api from '../../api/axiosConfig';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Como el backend solo provee CRUD básico, traemos los usuarios y verificamos
      const response = await api.get('/usuarios');
      const usuarios = response.data;

      if (!Array.isArray(usuarios)) {
        console.error('Respuesta inesperada al consultar usuarios:', usuarios);
        throw new Error('La API no devolvio una lista de usuarios');
      }
      
      const usuarioValido = usuarios.find(
        (u) => u.usuNombre === formData.username && u.usuPassword === formData.password
      );

      if (usuarioValido) {
        // Intentar obtener la persona (Asumimos que perId == usuId por sincronía de creación)
        let personaData = null;
        try {
          const pRes = await api.get(`/personas/${usuarioValido.usuId}`);
          personaData = pRes.data;
        } catch (err) {
          // Si no existe, creamos un fallback para que el dashboard no falle
          personaData = {
            perId: usuarioValido.usuId,
            perNombreCompleto: usuarioValido.usuNombre,
            perCorreo: 'correo@ejemplo.com',
            perTelefono: '0000000000'
          };
        }
        
        const sessionData = { ...usuarioValido, persona: personaData };

        localStorage.setItem('user', JSON.stringify(sessionData));
        localStorage.setItem('token', 'mock-token-' + usuarioValido.usuId); 
        window.location.href = '/negocios';
      } else {
        setError('Usuario o contraseña incorrectos. Por favor, intenta de nuevo.');
      }
      
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor. Intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page flex-center">
      <Card className="auth-card">
        <CardContent>
          <div className="text-center mb-6">
            <h1 className="auth-title">Bienvenido de nuevo</h1>
            <p className="text-secondary">Inicia sesión en tu cuenta de VendeCerca</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <Input 
              label="Nombre de Usuario"
              type="text"
              icon={User}
              placeholder="tu_usuario"
              required
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            <Input 
              label="Contraseña"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            
            <div className="auth-options">
              <label className="flex items-center gap-2 text-sm text-secondary">
                <input type="checkbox" /> Recordarme
              </label>
              <a href="#" className="text-primary text-sm">¿Olvidaste tu contraseña?</a>
            </div>

            <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
              Iniciar Sesión
            </Button>
          </form>

          <p className="auth-footer-text">
            ¿No tienes una cuenta? <Link to="/register" className="text-primary font-medium">Regístrate</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;


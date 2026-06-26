import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, Mail, Phone } from 'lucide-react';
import api from '../../api/axiosConfig';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '', password: '', confirmPassword: '',
    fullName: '', email: '', phone: '' 
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    try {
      // 1. Crear el Usuario
      const userRes = await api.post('/usuarios', {
        usuNombre: formData.username,
        usuPassword: formData.password,
        usuActivo: true
      });
      
      const newUser = userRes.data;

      // 2. Crear la Persona vinculada a este usuario
      await api.post('/personas', {
        perNombreCompleto: formData.fullName,
        perCorreo: formData.email,
        perTelefono: formData.phone,
        perFecha: new Date().toISOString(),
        usuId: newUser // Spring Boot Data REST usually expects the object with ID
      });
      
      // Si todo sale bien, redirigimos al login
      navigate('/login');
    } catch (err) {
      console.error(err);
      setError('Hubo un error al registrar. Revisa que el nombre de usuario no exista.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page flex-center py-8">
      <Card className="auth-card" style={{ maxWidth: '600px' }}>
        <CardContent>
          <div className="text-center mb-6">
            <h1 className="auth-title">Crea tu cuenta</h1>
            <p className="text-secondary">Únete a la comunidad de VendeCerca</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="md:col-span-2"><h3 className="font-bold border-b border-[var(--border-light)] pb-2 mb-2">Datos de Cuenta</h3></div>
            <Input 
              label="Nombre de Usuario (Máx 15)" type="text" icon={User} placeholder="tu_usuario" maxLength={15} required
              value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
            <div className="hidden md:block"></div>
            <Input 
              label="Contraseña" type="password" icon={Lock} placeholder="••••••••" required
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <Input 
              label="Confirmar Contraseña" type="password" icon={Lock} placeholder="••••••••" required
              value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />

            <div className="md:col-span-2 mt-4"><h3 className="font-bold border-b border-[var(--border-light)] pb-2 mb-2">Datos Personales</h3></div>
            <div className="md:col-span-2">
              <Input 
                label="Nombre Completo" type="text" icon={User} placeholder="Juan Pérez" required
                value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              />
            </div>
            <Input 
              label="Correo Electrónico" type="email" icon={Mail} placeholder="correo@ejemplo.com" required
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Teléfono" type="tel" icon={Phone} placeholder="1234567890" required
              value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />

            <div className="md:col-span-2">
              <Button type="submit" variant="primary" className="w-full mt-4" isLoading={loading}>
                Registrarse
              </Button>
            </div>
          </form>

          <p className="auth-footer-text mt-4">
            ¿Ya tienes una cuenta? <Link to="/login" className="text-primary font-medium">Inicia Sesión</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;

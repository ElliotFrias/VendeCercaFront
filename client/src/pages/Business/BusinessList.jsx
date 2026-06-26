import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Store } from 'lucide-react';
import api from '../../api/axiosConfig';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import './BusinessList.css';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await api.get('/negocios');
        
        const currentUser = JSON.parse(localStorage.getItem('user'));
        const myPerId = currentUser?.persona?.perId;

        // Only show active businesses, and hide the ones belonging to the current user
        const active = response.data.filter(b => {
          if (b.negActivo === false) return false;
          
          if (myPerId && b.perId) {
            const bizPerId = typeof b.perId === 'object' ? b.perId.perId : b.perId;
            if (parseInt(bizPerId) === parseInt(myPerId)) return false;
          }
          
          return true;
        });
        setBusinesses(active);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter(b => 
    b.negNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.negDescripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8 animate-fade-in" style={{ minHeight: '60vh' }}>
      <div className="business-header mb-8">
        <h1 className="page-title text-3xl font-bold">Explorar Negocios</h1>
        <p className="text-secondary mb-4">Encuentra los mejores productos y servicios locales.</p>
        <div className="max-w-md">
          <Input 
            icon={Search}
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex-center py-12">
          <div className="animate-pulse text-secondary font-bold">Cargando negocios...</div>
        </div>
      ) : filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(business => (
            <Link to={`/negocios/${business.negId}`} key={business.negId} className="block group">
              <Card hoverable className="h-full flex flex-col bg-[var(--bg-secondary)] border-[var(--glass-border)] group-hover:border-[var(--primary)] transition-colors">
                <div className="h-32 bg-[var(--primary-light)] border-b border-[var(--border-light)] flex items-center justify-center relative overflow-hidden">
                  <Store size={48} className="text-[var(--primary)] opacity-50" />
                  {/* Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold text-white shadow-sm ${business.negAbierto ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}`}>
                    {business.negAbierto ? 'Abierto' : 'Cerrado'}
                  </div>
                </div>
                <CardContent className="flex flex-col flex-1 p-5">
                  <h3 className="text-xl font-bold mb-2 text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{business.negNombre}</h3>
                  <p className="text-secondary text-sm flex-1 line-clamp-3 mb-4">{business.negDescripcion}</p>
                  
                  <div className="flex items-center text-xs text-secondary mt-auto pt-4 border-t border-[var(--border-light)]">
                    <MapPin size={14} className="mr-1" /> 
                    <span>{business.negAmbulante ? 'Ambulante' : 'Local Fijo'}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-[var(--border-light)] rounded-lg bg-[var(--bg-secondary)]">
          <Store size={48} className="mx-auto text-secondary opacity-50 mb-4" />
          <h3 className="text-secondary">No se encontraron negocios.</h3>
        </div>
      )}
    </div>
  );
};

export default BusinessList;

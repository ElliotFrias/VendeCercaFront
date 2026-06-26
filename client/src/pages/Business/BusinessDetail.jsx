import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Star, MapPin, ArrowLeft, MessageCircle, Package, Image as ImageIcon, Send } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './BusinessDetail.css';

const BusinessDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [address, setAddress] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ text: '', stars: 5 });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch business details
        const bizRes = await api.get(`/negocios/${id}`);
        setBusiness(bizRes.data);
        
        // Fetch products
        const prodRes = await api.get('/productos-servicios');
        const bizProducts = prodRes.data.filter(p => {
          if (!p.negId) return false;
          const pNegId = typeof p.negId === 'object' ? p.negId.negId : p.negId;
          return pNegId === parseInt(id);
        });
        setProducts(bizProducts);
        
        // Fetch images
        const imgRes = await api.get('/imagenes');
        setImages(imgRes.data);

        // Fetch feedbacks
        const feedRes = await api.get('/feedbacks');
        const bizFeedbacks = feedRes.data.filter(f => {
          if (!f.negId) return false;
          const fNegId = typeof f.negId === 'object' ? f.negId.negId : f.negId;
          return fNegId === parseInt(id);
        });
        setFeedbacks(bizFeedbacks);

        // Fetch Address
        if (!bizRes.data.negAmbulante && bizRes.data.dirId) {
          const dirIdObj = typeof bizRes.data.dirId === 'object' ? bizRes.data.dirId.dirId : bizRes.data.dirId;
          const dRes = await api.get(`/direcciones/${dirIdObj}`);
          setAddress(dRes.data);
        }

      } catch (err) {
        console.error('Error fetching business detail:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const getProductImage = (productId) => {
    const pImgs = images.filter(img => img.proId && (typeof img.proId === 'object' ? img.proId.proId : img.proId) === productId);
    return pImgs.length > 0 ? pImgs[0].imgUrl : null;
  };

  const submitFeedback = async (e) => {
    e.preventDefault();
    if (!currentUser || !currentUser.persona) {
      alert("Debes iniciar sesión y configurar tu perfil para dejar reseñas.");
      return;
    }
    
    try {
      setSubmittingFeedback(true);
      const payload = {
        fedTexto: feedbackData.text,
        fedEstrella: feedbackData.stars,
        fedFecha: new Date().toISOString(),
        perId: { perId: currentUser.persona.perId },
        negId: { negId: parseInt(id) }
      };
      
      const res = await api.post('/feedbacks', payload);
      setFeedbacks(prev => [...prev, res.data]);
      setShowFeedbackForm(false);
      setFeedbackData({ text: '', stars: 5 });
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert("Hubo un error al enviar la reseña.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const averageStars = feedbacks.length > 0 
    ? (feedbacks.reduce((acc, curr) => acc + curr.fedEstrella, 0) / feedbacks.length).toFixed(1)
    : 0;

  const handleStartChat = async () => {
    if (!currentUser || !currentUser.persona) {
      alert("Debes iniciar sesión y configurar tu perfil para enviar mensajes.");
      return;
    }
    
    try {
      setLoading(true);
      const res = await api.get('/chats');
      const existing = res.data.find(c => {
        const compId = typeof c.perIdComprador === 'object' ? c.perIdComprador.perId : c.perIdComprador;
        const cNegId = typeof c.negId === 'object' ? c.negId.negId : c.negId;
        return compId === currentUser.persona.perId && cNegId === parseInt(id);
      });

      if (!existing) {
        const businessOwnerId = typeof business.perId === 'object' ? business.perId.perId : business.perId;
        await api.post('/chats', {
          perIdComprador: { perId: currentUser.persona.perId },
          perIdVendedor: { perId: businessOwnerId },
          negId: { negId: parseInt(id) }
        });
      }
      navigate('/dashboard?tab=messages');
    } catch (e) {
      console.error("Error starting chat:", e);
      alert("Error al iniciar chat");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center py-12" style={{ minHeight: '60vh' }}>
        <div className="animate-pulse text-secondary font-bold">Cargando información del negocio...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="container py-12 text-center" style={{ minHeight: '60vh' }}>
        <h2>Negocio no encontrado</h2>
        <Link to="/negocios" className="btn btn-primary mt-4">Volver al directorio</Link>
      </div>
    );
  }



  return (
    <div className="business-detail-page animate-fade-in">
      {/* Cover and Header */}
      <div className="business-cover relative bg-[var(--primary-light)] border-b border-[var(--border-light)] min-h-[250px] flex items-end pb-8">
        <div className="container h-full relative z-10">
          <div className="business-header-card glass-panel p-6 inline-block max-w-full md:max-w-2xl mt-12">
            <Link to="/negocios" className="back-link flex items-center gap-2 text-primary mb-4">
              <ArrowLeft size={16} /> Volver al directorio
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold mb-2">{business.negNombre}</h1>
            <div className="business-tags flex gap-2 mt-3">
              <span className="bg-[var(--primary)] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Negocio Local</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${business.negAbierto ? 'bg-[var(--success)] text-white' : 'bg-[var(--danger)] text-white'}`}>
                {business.negAbierto ? 'Abierto' : 'Cerrado'}
              </span>
              <span className="bg-[var(--bg-secondary)] border border-[var(--glass-border)] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                {feedbacks.length > 0 ? `${averageStars} (${feedbacks.length} reseñas)` : 'Nuevo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8 flex flex-col md:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-8">
          <section className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--glass-border)]">
            <h2 className="text-xl font-bold mb-4 border-b border-[var(--border-light)] pb-2">Acerca de nosotros</h2>
            <p className="text-secondary leading-relaxed whitespace-pre-wrap">{business.negDescripcion || 'Sin descripción disponible.'}</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Package className="text-primary"/> Productos y Servicios</h2>
            
            {products.length === 0 ? (
              <div className="p-8 border border-[var(--border-light)] rounded-lg text-center text-secondary bg-[var(--bg-secondary)]">
                <p>Aún no hay productos registrados para este negocio.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.map(prod => {
                  const imgUrl = getProductImage(prod.proId);
                  return (
                    <div key={prod.proId} className="flex flex-col bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl overflow-hidden hover:-translate-y-1 transition-transform duration-300">
                      <div className="h-48 w-full bg-[var(--bg-primary)] border-b border-[var(--border-light)] flex-center overflow-hidden">
                        {imgUrl ? (
                          <img src={imgUrl} alt={prod.proNombre} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={48} className="text-[var(--text-muted)] opacity-50" />
                        )}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg text-[var(--text-primary)]">{prod.proNombre}</h3>
                          <span className="text-primary font-bold bg-[var(--primary-light)] px-2 py-1 rounded text-sm">${prod.proPrecio}</span>
                        </div>
                        <p className="text-secondary text-sm flex-1 mb-4">{prod.proDescripcion}</p>
                        <Button variant="secondary" className="w-full text-sm">Preguntar por esto</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="bg-[var(--bg-secondary)] p-6 rounded-xl border border-[var(--glass-border)]">
            <div className="flex justify-between items-center mb-6 border-b border-[var(--border-light)] pb-2">
              <h2 className="text-xl font-bold">Reseñas de Clientes</h2>
              <div className="flex items-center gap-2">
                <Star className="text-yellow-400 fill-current" size={20} />
                <span className="font-bold text-lg">{feedbacks.length > 0 ? averageStars : '-'}</span>
              </div>
            </div>

            {feedbacks.length === 0 ? (
              <p className="text-secondary text-center py-4">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
            ) : (
              <div className="flex flex-col gap-4">
                {feedbacks.map(fb => (
                  <div key={fb.fedId} className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-light)]">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold">{typeof fb.perId === 'object' ? fb.perId.perNombreCompleto : 'Cliente'}</span>
                        <div className="text-xs text-secondary mt-1">{new Date(fb.fedFecha).toLocaleDateString()}</div>
                      </div>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < fb.fedEstrella ? 'fill-current' : 'opacity-30'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-secondary mt-2">{fb.fedTexto}</p>
                  </div>
                ))}
              </div>
            )}

            {showFeedbackForm && (
              <form onSubmit={submitFeedback} className="mt-6 bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--primary)] shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                <h3 className="font-bold mb-3">Escribir una reseña</h3>
                <div className="flex gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setFeedbackData({...feedbackData, stars: star})}
                      className={`transition-colors ${star <= feedbackData.stars ? 'text-yellow-400' : 'text-gray-500'}`}
                    >
                      <Star size={24} className={star <= feedbackData.stars ? 'fill-current' : ''} />
                    </button>
                  ))}
                </div>
                <textarea 
                  required
                  rows="3"
                  className="w-full bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded p-2 text-[var(--text-primary)] mb-3 focus:border-[var(--primary)] focus:outline-none"
                  placeholder="¿Qué te pareció este negocio?"
                  value={feedbackData.text}
                  onChange={e => setFeedbackData({...feedbackData, text: e.target.value})}
                ></textarea>
                <div className="flex gap-2">
                  <Button type="submit" variant="primary" isLoading={submittingFeedback}>Publicar</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowFeedbackForm(false)}>Cancelar</Button>
                </div>
              </form>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0">
          <Card className="sticky top-6">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-4 border-b border-[var(--border-light)] pb-2">Contacto y Ubicación</h3>
              <ul className="flex flex-col gap-4 text-secondary mb-6">
                <li className="flex items-start gap-3">
                  <MapPin className="text-primary flex-shrink-0 mt-1" size={20} />
                  <span>
                    {business.negAmbulante ? 'Negocio Ambulante' : 'Ubicación física'}
                    <br/>
                    <span className="text-sm opacity-75">
                      {business.negAmbulante ? 'No hay dirección específica disponible.' : (address ? `${address.dirCalle} #${address.dirNumero}, ${address.dirColonia}, CP: ${address.dirCp}` : 'Cargando dirección...')}
                    </span>
                  </span>
                </li>
              </ul>
              
              <div className="flex flex-col gap-3">
                <Button variant="primary" className="w-full justify-center" onClick={handleStartChat}>
                  <MessageCircle size={18} className="mr-2" /> Enviar Mensaje
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-center border border-[var(--border-light)]"
                  onClick={() => setShowFeedbackForm(true)}
                  disabled={showFeedbackForm}
                >
                  <Star size={18} className="mr-2" /> Dejar Feedback
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetail;

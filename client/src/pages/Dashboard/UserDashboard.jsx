import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Settings, ShoppingBag, Heart, Edit2, Trash2, Package, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import api from '../../api/axiosConfig';
import ProductManager from '../../components/dashboard/ProductManager';
import ChatManager from '../../components/dashboard/ChatManager';

const UserDashboard = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);
  
  // States
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Forms states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  
  const [profileData, setProfileData] = useState({ username: '', password: '', fullName: '', phone: '', email: '' });
  const [businessData, setBusinessData] = useState({ 
    id: null, name: '', description: '', isAmbulante: false,
    dirId: null, calle: '', colonia: '', numero: '', indicaciones: '', cp: ''
  });
  
  // Relational data
  const [myBusinesses, setMyBusinesses] = useState([]);
  const [activeBusinessId, setActiveBusinessId] = useState(null); // Para ver los productos
  const [favorites, setFavorites] = useState([]);
  const [settings, setSettings] = useState({ notifications: true, darkMode: true });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setProfileData({ 
        username: parsed.usuNombre, 
        password: parsed.usuPassword,
        fullName: parsed.persona?.perNombreCompleto || '',
        phone: parsed.persona?.perTelefono || '',
        email: parsed.persona?.perCorreo || ''
      });
      fetchMyBusinesses(parsed);
      
      const localSets = JSON.parse(localStorage.getItem(`set_${parsed.usuId}`)) || { notifications: true, darkMode: true };
      setSettings(localSets);
    }
  }, []);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  // --- API Fetches ---
  const fetchMyBusinesses = async (currentUser) => {
    try {
      const perIdToMatch = currentUser.persona?.perId;
      if (!perIdToMatch) return;
      const res = await api.get('/negocios');
      // Filtrar negocios. Manejamos el caso donde perId puede ser un número por @JsonIdentityInfo o un objeto completo
      const misNegocios = res.data.filter(n => {
        if (!n.perId) return false;
        const negocioPerId = typeof n.perId === 'object' ? n.perId.perId : n.perId;
        return parseInt(negocioPerId) === parseInt(perIdToMatch);
      });
      setMyBusinesses(misNegocios);
    } catch (e) {
      console.error(e);
    }
  };

  // --- Profile Actions ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resUsu = await api.put(`/usuarios/${user.usuId}`, {
        usuId: user.usuId,
        usuNombre: profileData.username,
        usuPassword: profileData.password,
        usuActivo: user.usuActivo
      });
      
      let updatedPersona = user.persona;
      if (user.persona && user.persona.perId) {
        const resPer = await api.put(`/personas/${user.persona.perId}`, {
          perId: user.persona.perId,
          perNombreCompleto: profileData.fullName,
          perTelefono: profileData.phone,
          perCorreo: profileData.email,
          perFecha: user.persona.perFecha,
          usuId: { usuId: user.usuId } 
        });
        updatedPersona = resPer.data;
      }
      
      const updatedUser = { ...resUsu.data, persona: updatedPersona };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditingProfile(false);
      showMsg('Perfil actualizado correctamente.');
    } catch (err) {
      showMsg('Error al actualizar perfil.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // --- Business Actions ---
  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Guardar la Dirección
      const dirPayload = {
        dirCalle: businessData.calle,
        dirColonia: businessData.colonia,
        dirNumero: businessData.numero || "S/N",
        dirIndicaciones: businessData.indicaciones,
        dirCp: parseInt(businessData.cp) || 0,
        dirUltimaUbicacion: new Date().toISOString()
      };

      let finalDirId = businessData.dirId;

      if (!businessData.isAmbulante) {
        if (finalDirId) {
          await api.put(`/direcciones/${finalDirId}`, dirPayload);
        } else {
          const dirRes = await api.post('/direcciones', dirPayload);
          finalDirId = dirRes.data.dirId;
        }
      }

      // 2. Guardar el Negocio
      const payload = {
        negNombre: businessData.name,
        negDescripcion: businessData.description,
        negFecha: new Date().toISOString(),
        negActivo: true,
        negAmbulante: businessData.isAmbulante,
        negAbierto: true,
        perId: { perId: user.persona?.perId }, 
        dirId: finalDirId ? { dirId: finalDirId } : null
      };

      if (isEditingBusiness) {
        await api.put(`/negocios/${businessData.id}`, payload);
        showMsg('Negocio actualizado exitosamente!');
      } else {
        await api.post('/negocios', payload);
        showMsg('¡Negocio creado exitosamente!');
      }
      
      setShowBusinessForm(false);
      setIsEditingBusiness(false);
      setBusinessData({ id: null, name: '', description: '', isAmbulante: false, dirId: null, calle: '', colonia: '', numero: '', indicaciones: '', cp: '' });
      fetchMyBusinesses(user);
    } catch (error) {
      showMsg('Error al guardar el negocio.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const editBusiness = async (biz) => {
    let dirData = { dirId: null, calle: '', colonia: '', numero: '', indicaciones: '', cp: '' };
    
    // Attempt to load existing address
    if (!biz.negAmbulante && biz.dirId) {
      try {
        const dirIdObj = typeof biz.dirId === 'object' ? biz.dirId.dirId : biz.dirId;
        const dRes = await api.get(`/direcciones/${dirIdObj}`);
        dirData = {
          dirId: dRes.data.dirId,
          calle: dRes.data.dirCalle,
          colonia: dRes.data.dirColonia,
          numero: dRes.data.dirNumero,
          indicaciones: dRes.data.dirIndicaciones,
          cp: dRes.data.dirCp
        };
      } catch (e) {
        console.error("No se pudo cargar la direccion");
      }
    }

    setBusinessData({ 
      id: biz.negId, 
      name: biz.negNombre, 
      description: biz.negDescripcion,
      isAmbulante: biz.negAmbulante,
      ...dirData
    });
    setIsEditingBusiness(true);
    setShowBusinessForm(true);
  };

  const removeBusiness = async (bizId) => {
    if(!window.confirm("¿Estás seguro de eliminar este negocio y todos sus productos?")) return;
    try {
      await api.delete(`/negocios/${bizId}`);
      showMsg('Negocio eliminado correctamente.');
      fetchMyBusinesses(user);
    } catch (e) {
      showMsg('Error al eliminar el negocio.', 'error');
    }
  };

  // --- Settings Actions ---
  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    localStorage.setItem(`set_${user?.usuId}`, JSON.stringify(newSettings));
    showMsg('Ajustes guardados.');
  };

  // Navigation hook para manejar cambio de tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setActiveBusinessId(null);
  }

  const activeBusinessObj = activeBusinessId ? myBusinesses.find(b => b.negId === activeBusinessId) : null;

  return (
    <div className="container py-8" style={{ minHeight: '60vh' }}>
      <h1 className="page-title mb-8">Mi Perfil</h1>
      
      <div className="flex gap-8 flex-col md:flex-row">
        {/* Sidebar Menu */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <Button variant={activeTab === 'profile' ? 'primary' : 'ghost'} className="justify-start w-full" onClick={() => handleTabChange('profile')}>
            <User size={18} className="mr-2" /> Mi Información
          </Button>
          <Button variant={activeTab === 'business' ? 'primary' : 'ghost'} className="justify-start w-full" onClick={() => handleTabChange('business')}>
            <ShoppingBag size={18} className="mr-2" /> Mis Negocios
          </Button>
          <Button variant={activeTab === 'messages' ? 'primary' : 'ghost'} className="justify-start w-full" onClick={() => handleTabChange('messages')}>
            <MessageCircle size={18} className="mr-2" /> Mensajes
          </Button>
          <Button variant={activeTab === 'favorites' ? 'primary' : 'ghost'} className="justify-start w-full" onClick={() => handleTabChange('favorites')}>
            <Heart size={18} className="mr-2" /> Guardados
          </Button>
          <Button variant={activeTab === 'settings' ? 'primary' : 'ghost'} className="justify-start w-full" onClick={() => handleTabChange('settings')}>
            <Settings size={18} className="mr-2" /> Ajustes
          </Button>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === 'profile' && 'Información Personal'}
                {activeTab === 'business' && (activeBusinessObj ? `Gestión de Productos` : 'Gestión de Mis Negocios')}
                {activeTab === 'messages' && 'Bandeja de Mensajes'}
                {activeTab === 'favorites' && 'Negocios Favoritos'}
                {activeTab === 'settings' && 'Ajustes de Cuenta'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {message.text && (
                <div className={`mb-4 p-3 rounded-md border ${message.type === 'error' ? 'border-[var(--danger)] text-[var(--danger)] bg-[rgba(239,68,68,0.1)]' : 'border-[var(--success)] text-[var(--success)] bg-[rgba(16,185,129,0.1)]'}`}>
                  {message.text}
                </div>
              )}
              
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="text-secondary">
                  {!isEditingProfile ? (
                    <>
                      <div className="mb-6 p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--glass-border)]">
                        <p className="mb-2"><strong>Nombre Completo:</strong> {user?.persona?.perNombreCompleto || 'No especificado'}</p>
                        <p className="mb-2"><strong>Correo:</strong> {user?.persona?.perCorreo || 'No especificado'}</p>
                        <p className="mb-2"><strong>Teléfono:</strong> {user?.persona?.perTelefono || 'No especificado'}</p>
                        <hr className="my-4 border-[var(--border-light)]" />
                        <p className="mb-2"><strong>Nombre de Usuario:</strong> {user?.usuNombre}</p>
                        <p><strong>Contraseña:</strong> ••••••••</p>
                      </div>
                      <Button variant="primary" onClick={() => setIsEditingProfile(true)}>Editar Perfil</Button>
                    </>
                  ) : (
                    <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 max-w-md">
                      <h3 className="font-bold border-b border-[var(--border-light)] pb-2">Datos Personales</h3>
                      <Input label="Nombre Completo" required value={profileData.fullName} onChange={e => setProfileData({...profileData, fullName: e.target.value})} />
                      <Input label="Correo Electrónico" type="email" required value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})} />
                      <Input label="Teléfono" type="tel" required value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} />
                      
                      <h3 className="font-bold border-b border-[var(--border-light)] pb-2 mt-4">Cuenta</h3>
                      <Input label="Nombre de Usuario" required value={profileData.username} onChange={e => setProfileData({...profileData, username: e.target.value})} />
                      <Input label="Nueva Contraseña" type="password" required value={profileData.password} onChange={e => setProfileData({...profileData, password: e.target.value})} />
                      <div className="flex gap-4 mt-2">
                        <Button type="submit" variant="primary" isLoading={loading}>Guardar Cambios</Button>
                        <Button type="button" variant="ghost" onClick={() => setIsEditingProfile(false)}>Cancelar</Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* BUSINESS TAB */}
              {activeTab === 'business' && (
                <div className="text-secondary">
                  {activeBusinessObj ? (
                    <ProductManager 
                      business={activeBusinessObj} 
                      onBack={() => setActiveBusinessId(null)} 
                      showMsg={showMsg} 
                    />
                  ) : !showBusinessForm ? (
                    <>
                      <div className="mb-6 flex gap-4">
                        <Button variant="primary" onClick={() => { 
                          setIsEditingBusiness(false); 
                          setBusinessData({ id: null, name: '', description: '', isAmbulante: false, dirId: null, calle: '', colonia: '', numero: '', indicaciones: '', cp: '' }); 
                          setShowBusinessForm(true); 
                        }}>
                          Registrar Nuevo Negocio
                        </Button>
                      </div>
                      
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Mis Negocios ({myBusinesses.length})</h3>
                      {myBusinesses.length === 0 ? (
                        <p className="p-4 border border-[var(--border-light)] rounded text-center">Aún no has registrado ningún negocio.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {myBusinesses.map((biz) => (
                            <div key={biz.negId} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--glass-border)]">
                              <div className="mb-2 md:mb-0">
                                <h4 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2">
                                  {biz.negNombre} {biz.negAmbulante && <span className="text-xs bg-[var(--bg-primary)] px-2 py-1 rounded text-secondary border border-[var(--border-light)]">Ambulante</span>}
                                </h4>
                                <p className="text-sm line-clamp-2">{biz.negDescripcion}</p>
                              </div>
                              <div className="flex gap-2 mt-2 md:mt-0">
                                <Button variant="secondary" className="px-3 py-1 text-sm" onClick={() => setActiveBusinessId(biz.negId)}>
                                  <Package size={16} className="mr-2" /> Productos
                                </Button>
                                <Button variant="ghost" className="text-[var(--primary)] px-2" onClick={() => editBusiness(biz)} title="Editar Negocio">
                                  <Edit2 size={18} />
                                </Button>
                                <Button variant="ghost" className="text-[var(--danger)] px-2" onClick={() => removeBusiness(biz.negId)} title="Eliminar Negocio">
                                  <Trash2 size={18} />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <form onSubmit={handleSaveBusiness} className="flex flex-col gap-4 max-w-2xl bg-[var(--bg-secondary)] border border-[var(--glass-border)] p-6 rounded-lg">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] border-b border-[var(--border-light)] pb-2 mb-2">
                        {isEditingBusiness ? 'Editar Negocio' : 'Datos del Negocio'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Input label="Nombre del Negocio" required value={businessData.name} onChange={e => setBusinessData({...businessData, name: e.target.value})} />
                        </div>
                        <div className="md:col-span-2">
                          <Input label="Descripción (Max 300)" required value={businessData.description} onChange={e => setBusinessData({...businessData, description: e.target.value})} />
                        </div>
                        
                        <div className="md:col-span-2 flex items-center gap-3 bg-[var(--bg-primary)] p-3 rounded-lg border border-[var(--border-light)] mt-2">
                          <input 
                            type="checkbox" 
                            id="isAmbulante" 
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                            checked={businessData.isAmbulante} 
                            onChange={e => setBusinessData({...businessData, isAmbulante: e.target.checked})} 
                          />
                          <label htmlFor="isAmbulante" className="font-bold text-[var(--text-primary)] select-none cursor-pointer">
                            Mi negocio es Ambulante (No tiene dirección fija)
                          </label>
                        </div>

                        {!businessData.isAmbulante && (
                          <>
                            <div className="md:col-span-2 mt-4">
                              <h4 className="font-bold text-[var(--text-primary)]">Dirección Física</h4>
                              <p className="text-xs text-secondary mb-2">Llena la información para que tus clientes te encuentren en el mapa.</p>
                            </div>
                            <div className="md:col-span-2">
                              <Input label="Calle" required={!businessData.isAmbulante} value={businessData.calle} onChange={e => setBusinessData({...businessData, calle: e.target.value})} />
                            </div>
                            <Input label="Número Exterior/Interior" value={businessData.numero} onChange={e => setBusinessData({...businessData, numero: e.target.value})} />
                            <Input label="Código Postal" required={!businessData.isAmbulante} type="number" value={businessData.cp} onChange={e => setBusinessData({...businessData, cp: e.target.value})} />
                            <div className="md:col-span-2">
                              <Input label="Colonia / Barrio" required={!businessData.isAmbulante} value={businessData.colonia} onChange={e => setBusinessData({...businessData, colonia: e.target.value})} />
                            </div>
                            <div className="md:col-span-2">
                              <Input label="Indicaciones adicionales (Opcional)" value={businessData.indicaciones} onChange={e => setBusinessData({...businessData, indicaciones: e.target.value})} />
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex gap-4 mt-6 pt-4 border-t border-[var(--border-light)]">
                        <Button type="submit" variant="primary" isLoading={loading}>{isEditingBusiness ? 'Guardar Cambios' : 'Crear Negocio'}</Button>
                        <Button type="button" variant="ghost" onClick={() => setShowBusinessForm(false)}>Cancelar</Button>
                      </div>
                    </form>
                  )}
                </div>
              )}
              
              {/* FAVORITES TAB */}
              {activeTab === 'favorites' && (
                <div className="text-secondary">
                  {favorites.length === 0 ? (
                    <div className="text-center p-8 border border-[var(--glass-border)] rounded-lg">
                      <Heart size={48} className="mx-auto mb-4 text-[var(--border-light)]" />
                      <p className="mb-4">No tienes negocios guardados.</p>
                      <Button variant="secondary" onClick={() => window.location.href='/negocios'}>Explorar negocios</Button>
                    </div>
                  ) : (
                    <p>Aquí aparecerán tus favoritos (Requiere integración extra).</p>
                  )}
                </div>
              )}
              
              {/* SETTINGS TAB */}
              {activeTab === 'settings' && (
                <div className="text-secondary flex flex-col gap-4">
                  <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)]">Notificaciones Push</h4>
                      <p className="text-sm">Recibir alertas de mensajes y ofertas.</p>
                    </div>
                    <Button variant={settings.notifications ? 'primary' : 'secondary'} onClick={() => toggleSetting('notifications')}>
                      {settings.notifications ? 'Activado' : 'Desactivado'}
                    </Button>
                  </div>
                  
                  <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-[var(--text-primary)]">Modo Oscuro</h4>
                      <p className="text-sm">Preferencia de tema visual.</p>
                    </div>
                    <Button variant={settings.darkMode ? 'primary' : 'secondary'} onClick={() => toggleSetting('darkMode')}>
                      {settings.darkMode ? 'Activado' : 'Desactivado'}
                    </Button>
                  </div>
                </div>
              )}

              {/* MESSAGES TAB */}
              {activeTab === 'messages' && (
                <ChatManager currentUser={user} showMsg={showMsg} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

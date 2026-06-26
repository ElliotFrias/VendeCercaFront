import { useState, useEffect } from 'react';
import { Package, Edit2, Trash2, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axiosConfig';
import Button from '../ui/Button';
import Input from '../ui/Input';

const ProductManager = ({ business, onBack, showMsg }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [categories, setCategories] = useState([]);
  
  // Form State
  const [formData, setFormData] = useState({ 
    id: null, name: '', description: '', price: '', quantity: '', imgUrl: '', tprId: '' 
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [business]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/tipos-producto');
      let cats = res.data;
      if (cats.length === 0) {
        // Create a default category to prevent errors if DB is empty
        const newCat = await api.post('/tipos-producto', { tprNombre: 'General' });
        cats = [newCat.data];
      }
      setCategories(cats);
      if (cats.length > 0) {
        setFormData(prev => ({ ...prev, tprId: cats[0].tprId }));
      }
    } catch (e) {
      console.error('Error fetching categories:', e);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/productos-servicios');
      const filtered = res.data.filter(p => {
        if (!p.negId) return false;
        const pNegId = typeof p.negId === 'object' ? p.negId.negId : p.negId;
        return pNegId === business.negId;
      });
      setProducts(filtered);
    } catch (err) {
      console.error(err);
      showMsg('Error al cargar los productos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        negId: { negId: typeof business.negId === 'object' ? business.negId?.negId : business.negId },
        tprId: { tprId: formData.tprId || (categories.length > 0 ? categories[0].tprId : null) },
        proNombre: formData.name,
        proDescripcion: formData.description,
        proFecha: new Date().toISOString(),
        proActivo: true,
        proPrecio: parseFloat(formData.price),
        proCantidad: parseInt(formData.quantity) || 0
      };

      let savedProduct;

      if (isEditing) {
        const res = await api.put(`/productos-servicios/${formData.id}`, payload);
        savedProduct = res.data;
        showMsg('Producto actualizado con éxito.');
      } else {
        const res = await api.post('/productos-servicios', payload);
        savedProduct = res.data;
        showMsg('Producto añadido con éxito.');
      }

      // Manejo de la imagen (simplificado a un solo link principal según ImagenController)
      if (formData.imgUrl) {
        try {
          // Buscamos si ya tiene imagenes
          const imgsRes = await api.get('/imagenes');
          const productImg = imgsRes.data.find(i => i.proId && i.proId.proId === savedProduct.proId);

          if (productImg) {
            await api.put(`/imagenes/${productImg.imgId}`, {
              imgId: productImg.imgId,
              imgUrl: formData.imgUrl,
              imgPrincipal: true,
              proId: { proId: typeof savedProduct.proId === 'object' ? savedProduct.proId?.proId : savedProduct.proId },
              negId: { negId: typeof business.negId === 'object' ? business.negId?.negId : business.negId }
            });
          } else {
            await api.post('/imagenes', {
              imgUrl: formData.imgUrl,
              imgPrincipal: true,
              proId: { proId: typeof savedProduct.proId === 'object' ? savedProduct.proId?.proId : savedProduct.proId },
              negId: { negId: typeof business.negId === 'object' ? business.negId?.negId : business.negId }
            });
          }
        } catch (imgErr) {
          console.error("Error guardando imagen:", imgErr);
        }
      }

      setShowForm(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      showMsg('Error al guardar el producto.', 'error');
      setLoading(false);
    }
  };

  const handleEdit = async (prod) => {
    setIsEditing(true);
    setFormData({
      id: prod.proId,
      name: prod.proNombre,
      description: prod.proDescripcion,
      price: prod.proPrecio,
      quantity: prod.proCantidad,
      imgUrl: '', // No traemos la url en este mock para simplificar, idealmente haríamos fetch a /imagenes
      tprId: typeof prod.tprId === 'object' ? prod.tprId?.tprId : prod.tprId
    });
    
    // Attempt to load image url
    try {
      const imgsRes = await api.get('/imagenes');
      const productImg = imgsRes.data.find(i => i.proId && i.proId.proId === prod.proId);
      if (productImg) {
        setFormData(prev => ({...prev, imgUrl: productImg.imgUrl}));
      }
    } catch (e) {}

    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      await api.delete(`/productos-servicios/${id}`);
      showMsg('Producto eliminado.');
      fetchProducts();
    } catch (err) {
      showMsg('Error al eliminar producto.', 'error');
    }
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', description: '', price: '', quantity: '', imgUrl: '', tprId: categories.length > 0 ? categories[0].tprId : '' });
    setIsEditing(false);
  };

  if (loading && !showForm) return <div className="p-8 text-center animate-pulse text-[var(--text-secondary)]">Cargando productos...</div>;

  return (
    <div className="product-manager animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="px-2"><ArrowLeft size={20} /></Button>
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Productos de {business.negNombre}</h2>
          <p className="text-sm text-secondary">Administra el inventario de este negocio</p>
        </div>
      </div>

      {!showForm ? (
        <>
          <div className="mb-4 flex gap-4">
            <Button variant="primary" onClick={() => { resetForm(); setShowForm(true); }}>
              <Package size={18} className="mr-2" /> Añadir Producto
            </Button>
          </div>

          {products.length === 0 ? (
            <div className="p-8 border border-[var(--border-light)] rounded-lg text-center text-secondary bg-[var(--bg-secondary)]">
              <Package size={48} className="mx-auto mb-4 opacity-50" />
              <p>Este negocio aún no tiene productos registrados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map(prod => (
                <div key={prod.proId} className="flex gap-4 p-4 border border-[var(--glass-border)] bg-[var(--glass-bg)] rounded-lg">
                  <div className="w-16 h-16 bg-[var(--bg-primary)] rounded border border-[var(--border-light)] flex-center flex-shrink-0 overflow-hidden">
                     {/* Imagen mock o real */}
                     <ImageIcon size={24} className="text-[var(--text-muted)]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[var(--text-primary)]">{prod.proNombre}</h4>
                    <p className="text-sm text-secondary line-clamp-1">{prod.proDescripcion}</p>
                    <p className="text-primary font-medium mt-1">${prod.proPrecio}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" className="text-[var(--primary)] px-2 py-1 h-auto" onClick={() => handleEdit(prod)}><Edit2 size={16} /></Button>
                    <Button variant="ghost" className="text-[var(--danger)] px-2 py-1 h-auto" onClick={() => handleDelete(prod.proId)}><Trash2 size={16} /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-lg p-6 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-lg">
          <h3 className="font-bold border-b border-[var(--border-light)] pb-2">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          
          <Input label="Nombre del Producto/Servicio" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          
          <div className="flex flex-col gap-1 mb-2">
            <label className="text-sm font-bold text-[var(--text-primary)]">Categoría del Producto</label>
            <select 
              className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-light)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
              value={formData.tprId}
              onChange={e => setFormData({...formData, tprId: e.target.value})}
              required
            >
              <option value="">Selecciona una categoría...</option>
              {categories.map(cat => (
                <option key={cat.tprId} value={cat.tprId}>{cat.tprNombre}</option>
              ))}
            </select>
          </div>

          <Input label="Descripción" required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          
          <div className="flex gap-4">
            <div className="flex-1">
              <Input label="Precio ($)" type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div className="flex-1">
              <Input label="Cantidad Disponible" type="number" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
            </div>
          </div>

          <div className="mt-2">
            <h4 className="text-sm font-medium mb-2 text-[var(--text-secondary)]">Imagen del Producto (URL)</h4>
            <div className="flex gap-2">
              <ImageIcon size={20} className="mt-3 text-[var(--text-muted)]" />
              <div className="flex-1">
                <Input type="url" placeholder="https://ejemplo.com/imagen.jpg" value={formData.imgUrl} onChange={e => setFormData({...formData, imgUrl: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button type="submit" variant="primary" isLoading={loading}>{isEditing ? 'Guardar Cambios' : 'Añadir Producto'}</Button>
            <Button type="button" variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>Cancelar</Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductManager;

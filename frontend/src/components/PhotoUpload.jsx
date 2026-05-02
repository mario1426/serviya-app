import { useRef, useState } from 'react';
import api from '../services/api';

// Foto de perfil — círculo con cámara encima
export function ProfilePhotoUpload({ currentPhoto, name, onUploaded }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { url } = await api.post('/upload/photo', formData);
      onUploaded(url);
    } catch (err) {
      alert('Error al subir la foto: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative group"
        disabled={uploading}
      >
        <img
          src={currentPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=1E3A8A&color=fff&size=128`}
          alt="Foto de perfil"
          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
        />
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading
            ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <span className="text-white text-xl">📷</span>
          }
        </div>
      </button>
      <p className="text-xs text-gray-medium">Tocá para cambiar la foto</p>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// Portfolio — grilla de fotos con botón de agregar
export function PortfolioUpload({ photos = [], onPhotosChange }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photos.length >= 8) return alert('Máximo 8 fotos de portfolio');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      const { portfolioPhotos } = await api.post('/upload/portfolio', formData);
      onPhotosChange(portfolioPhotos);
    } catch (err) {
      alert('Error al subir la foto: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (url) => {
    if (!confirm('¿Eliminar esta foto?')) return;
    try {
      await api.delete('/upload/portfolio', { data: { url } });
      onPhotosChange(photos.filter(p => p !== url));
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-navy">Fotos de trabajos anteriores</h3>
        <p className="text-xs text-gray-medium mt-0.5">Mostrá tu trabajo a los clientes · máx. 8 fotos</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((url) => (
          <div key={url} className="relative group aspect-square">
            <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
            <button
              type="button"
              onClick={() => handleDelete(url)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}

        {photos.length < 8 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-square border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-red-50 transition-colors text-gray-medium hover:text-primary"
          >
            {uploading
              ? <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              : <>
                  <span className="text-2xl">📷</span>
                  <span className="text-xs font-medium">Agregar</span>
                </>
            }
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-light px-4">
      <div className="text-center">
        <p className="text-8xl mb-4">🔍</p>
        <h1 className="text-3xl font-bold text-navy mb-2">Página no encontrada</h1>
        <p className="text-gray-medium mb-6">Esta URL no existe en ServiYa</p>
        <button onClick={() => navigate('/')} className="btn-primary">Volver al inicio</button>
      </div>
    </div>
  );
}

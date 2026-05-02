import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleSelect() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { registerWithRole, firebaseUser } = useAuth();
  const navigate = useNavigate();

  if (!firebaseUser) {
    navigate('/login');
    return null;
  }

  const handleContinue = async () => {
    if (!selected) return;
    setLoading(true);
    setError('');
    try {
      const user = await registerWithRole(selected);
      navigate(user.role === 'worker' ? '/worker/profile/setup' : '/profile/setup');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy to-navy-dark flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-navy">¿Cómo vas a usar ServiYa?</h2>
          <p className="text-gray-medium text-sm mt-2">Elegí tu perfil para continuar</p>
        </div>

        <div className="space-y-3 mb-6">
          {[
            {
              value: 'client',
              icon: '👋',
              title: 'Necesito un servicio',
              desc: 'Contratá profesionales cercanos para tu hogar',
            },
            {
              value: 'worker',
              icon: '🛠️',
              title: 'Quiero ofrecer servicios',
              desc: 'Ganá dinero con tus habilidades en tu zona',
            },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelected(opt.value)}
              className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                selected === opt.value
                  ? 'border-primary bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{opt.icon}</span>
                <div>
                  <p className="font-semibold text-navy">{opt.title}</p>
                  <p className="text-sm text-gray-medium">{opt.desc}</p>
                </div>
                {selected === opt.value && (
                  <span className="ml-auto text-primary text-xl">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 text-primary text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="btn-primary w-full"
        >
          {loading ? 'Creando cuenta...' : 'Continuar'}
        </button>
      </div>
    </div>
  );
}

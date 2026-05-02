import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, persistenceReady } from '../firebase';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    // Esperar que la persistencia esté lista antes de suscribir,
    // así evitamos el error de IndexedDB
    persistenceReady.then(() => {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        // Resetear loading cada vez que cambia el auth state
        // para evitar redirecciones prematuras mientras se carga el usuario de MongoDB
        setLoading(true);
        setFirebaseUser(fbUser);
        if (fbUser) {
          try {
            const token = await fbUser.getIdToken();
            const me = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            console.log('[Auth] Usuario cargado:', me?.email, '| rol:', me?.role);
            setUser(me);
          } catch (err) {
            console.error('[Auth] Error al cargar usuario:', err.message);
            setUser(null);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const registerWithRole = async (role) => {
    const token = await auth.currentUser.getIdToken();
    const { user: newUser } = await api.post('/auth/register', { firebaseToken: token, role });
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const refreshUser = async () => {
    const token = await auth.currentUser.getIdToken(true);
    const me = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUser(me);
    return me;
  };

  return (
    <AuthContext.Provider value={{
      firebaseUser, user, loading,
      loginWithGoogle, registerWithRole, logout, refreshUser,
      isAuthenticated: !!user,
      isWorker: user?.role === 'worker',
      isAdmin: user?.role === 'admin',
      isClient: user?.role === 'client',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'client' | 'admin' | 'staff' | 'developer';
  avatar?: string;
  company?: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
        
        // Sauvegarder le token dans localStorage pour les requêtes API
        localStorage.setItem('authToken', token);
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        
        // Nettoyer le localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: 'miatech-auth', // Nom de la clé dans localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Hook pour vérifier si l'utilisateur est connecté et a un rôle spécifique
export const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(user.role);
  };

  const isAdmin = () => hasRole(['admin']);
  const isClient = () => hasRole(['client']);
  const isStaff = () => hasRole(['admin', 'staff']);

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    hasRole,
    isAdmin,
    isClient,
    isStaff,
  };
};
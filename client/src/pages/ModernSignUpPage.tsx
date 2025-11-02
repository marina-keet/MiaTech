import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const ModernSignUpPage: React.FC = () => {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Partial<SignUpFormData>>({});

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof SignUpFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto-login after successful registration
        if (data.token && data.user) {
          login(data.user, data.token);
          navigate('/dashboard');
        } else {
          // Registration successful but no auto-login, redirect to login
          navigate('/login?registered=true');
        }
      } else {
        setError(data.message || 'Erreur lors de l\'inscription');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 via-primary-50 to-accent-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-primary">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo & Header */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold font-secondary">M</span>
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-800 font-secondary">
          Rejoindre MiaTech
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600 font-primary">
          Créez votre compte et découvrez nos solutions technologiques
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/80 backdrop-blur-lg py-8 px-6 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-error-50 border border-error-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-error-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-error-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="block text-sm font-semibold text-neutral-700">
                  Prénom *
                </Label>
                <div className="mt-2">
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Jean"
                    error={!!errors.firstName}
                    className="block w-full"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-error-600">{errors.firstName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="lastName" className="block text-sm font-semibold text-neutral-700">
                  Nom *
                </Label>
                <div className="mt-2">
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Dupont"
                    error={!!errors.lastName}
                    className="block w-full"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-error-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="block text-sm font-semibold text-neutral-700">
                Adresse email *
              </Label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="jean.dupont@exemple.com"
                  error={!!errors.email}
                  className="block w-full"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-error-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-semibold text-neutral-700">
                Mot de passe *
              </Label>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Minimum 6 caractères"
                  error={!!errors.password}
                  className="block w-full"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-error-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-semibold text-neutral-700">
                Confirmer le mot de passe *
              </Label>
              <div className="mt-2">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Répéter le mot de passe"
                  error={!!errors.confirmPassword}
                  className="block w-full"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-error-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full justify-center"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Création en cours...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-600">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-neutral-200">
            <p className="text-xs text-neutral-500 text-center">
              En créant un compte, vous acceptez nos{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-500 underline">
                conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-500 underline">
                politique de confidentialité
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500">
            © 2025 MiaTech. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModernSignUpPage;

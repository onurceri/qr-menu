import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChefHat, QrCode, Smartphone, Leaf, Zap, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, signInWithGoogle, error } = useAuth();

  // Eğer kullanıcı zaten giriş yapmışsa, restaurants sayfasına yönlendir
  if (user) {
    return <Navigate to="/restaurants" replace />;
  }

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      // Auth context zaten kullanıcıyı yönlendirecek
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const features = [
    {
      icon: <Smartphone className="w-6 h-6 text-zinc-700" />,
      title: 'Temassız Menü',
      description: 'QR kod ile müşterilerinize temassız menü deneyimi sunun.'
    },
    {
      icon: <Leaf className="w-6 h-6 text-zinc-700" />,
      title: 'Çevre Dostu',
      description: 'Kağıt israfını önleyin, doğayı koruyun.'
    },
    {
      icon: <Zap className="w-6 h-6 text-zinc-700" />,
      title: 'Kolay Yönetim',
      description: 'Menünüzü kolayca oluşturun ve güncelleyin.'
    },
    {
      icon: <Clock className="w-6 h-6 text-zinc-700" />,
      title: 'Anlık Güncellemeler',
      description: 'Fiyat ve içerik değişiklikleriniz anında yayında.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-24 sm:pb-20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-3 rounded-2xl shadow-md">
              <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 text-zinc-900" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-zinc-900 tracking-tight">
            QR Menü Yönetimi
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-600 max-w-3xl mx-auto">
            Restoranınızın menüsünü dijitalleştirin, QR kod ile müşterilerinize modern bir deneyim sunun.
          </p>
          <div className="mt-10 flex justify-center">
            {error && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-full max-w-md">
                <div className="mx-4 p-4 text-sm text-red-700 bg-red-50 rounded-lg shadow-lg" role="alert">
                  {error}
                </div>
              </div>
            )}
            <button
              onClick={handleGoogleSignIn}
              className="btn-primary text-base sm:text-lg px-12 py-3 rounded-xl
                bg-zinc-900 text-white hover:bg-zinc-800 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500
                transition duration-200 flex items-center"
            >
              <img 
                src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" 
                alt="Google logo" 
                className="h-5 w-5 mr-3" 
              />
              Google ile Devam Et
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-900">
            Neden QR Menü?
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Modern restoranlar için modern çözümler
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-zinc-200 
                        hover:border-zinc-300 transition-colors duration-200
                        flex flex-col items-center text-center"
            >
              <div className="bg-zinc-50 p-3 rounded-xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-zinc-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Demo QR Section */}
        <div className="mt-20 text-center">
          <div className="inline-block bg-zinc-50 p-6 rounded-2xl">
            <QrCode className="h-24 w-24 sm:h-32 sm:w-32 text-zinc-900 mx-auto" />
            <p className="mt-4 text-sm text-zinc-500">
              Örnek QR Kod
            </p>
          </div>
          <p className="mt-6 text-zinc-600 max-w-2xl mx-auto">
            Müşterileriniz QR kodu telefonlarıyla okutarak menünüze anında erişebilir.
          </p>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-zinc-900 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Hemen Başlayın
          </h2>
          <p className="text-zinc-300 text-lg mb-10 max-w-2xl mx-auto">
            Google hesabınızla giriş yapın, menünüzü hazırlayın ve QR kodunuzu alın.
          </p>
          <button
            onClick={handleGoogleSignIn}
            className="btn-primary text-base sm:text-lg px-12 py-3 rounded-xl
              bg-white text-zinc-900 hover:bg-zinc-100
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500
              transition duration-200 flex items-center justify-center mx-auto"
          >
            <img 
              src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" 
              alt="Google logo" 
              className="h-5 w-5 mr-3" 
            />
            Google ile Devam Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
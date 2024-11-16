import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-zinc-50">
      <h1 className="text-5xl font-bold text-center text-zinc-900">
        Hoş Geldiniz!
      </h1>
      <p className="mt-4 text-lg text-center text-zinc-600">
        Uygulamamız ile restoran menünüzü QR kod ile dijitalleştirin.
      </p>
      <div className="mt-8 space-y-4">
        <h2 className="text-3xl font-semibold text-zinc-800">
          Neden QR Menü?
        </h2>
        <ul className="list-disc list-inside text-left text-zinc-600">
          <li>🤳 Temassız menü erişimi ile güvenliği artırın.</li>
          <li>🌳 Kağıt israfını azaltarak çevreye katkıda bulunun.</li>
          <li>💸 Ücretsiz ve kolay kullanım ile menünüzü yönetin.</li>
          <li>✨ Gerçek zamanlı güncellemeler ile menünüzü her an güncel tutun.</li>
        </ul>
      </div>
      <button 
        className="mt-6 px-6 py-3 bg-zinc-900 text-white rounded-lg 
        hover:bg-zinc-800 transition duration-300 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
        onClick={() => navigate('/login')}
      >
        Hemen Başlayın
      </button>
    </div>
  );
};

export default LandingPage;
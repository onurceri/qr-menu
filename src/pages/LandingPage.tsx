import React from 'react';

// Functional component for the landing page
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-5xl font-bold text-center text-blue-600">Hoş Geldiniz!</h1>
      <p className="mt-4 text-lg text-center text-gray-700">Uygulamamız ile restoran menünüzü QR kod ile dijitalleştirin.</p>
      <div className="mt-8 space-y-4">
        <h2 className="text-3xl font-semibold">Neden QR Menü?</h2>
        <ul className="list-disc list-inside text-left text-gray-600">
          <li>🤳 Temassız menü erişimi ile güvenliği artırın.</li>
          <li>🌳 Kağıt israfını azaltarak çevreye katkıda bulunun.</li>
          <li>💸 Ücretsiz ve kolay kullanım ile menünüzü yönetin.</li>
          <li>✨ Gerçek zamanlı güncellemeler ile menünüzü her an güncel tutun.</li>
        </ul>
      </div>
      <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
      onClick={() => navigate('/login')}>
        Hemen Başlayın
      </button>
    </div>
  );
};

export default LandingPage;
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, X } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuUrl: string;
  restaurantName: string;
}

export function QRCodeModal({ isOpen, onClose, menuUrl, restaurantName }: QRCodeModalProps) {
  if (!isOpen) return null;

  const downloadQRCode = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${restaurantName.toLowerCase().replace(/\s+/g, '-')}-menu-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Menu QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <QRCodeSVG
              value={menuUrl}
              size={200}
              level="H"
              includeMargin
              imageSettings={{
                src: "/vite.svg",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          
          <button
            onClick={downloadQRCode}
            className="btn w-full flex justify-center items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Download QR Code</span>
          </button>
          
          <p className="text-sm text-gray-500 text-center">
            Scan this QR code to view the digital menu
          </p>
        </div>
      </div>
    </div>
  );
}
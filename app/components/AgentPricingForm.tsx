'use client';

import { useState } from 'react';

interface AgentPricingFormProps {
  hotel: any;
  onSave: (pricing: {
    customerPrice: number;
    agentPrice: number;
    profitMargin: number;
  }) => void;
  onCancel: () => void;
}

export default function AgentPricingForm({ hotel, onSave, onCancel }: AgentPricingFormProps) {
  const [customerPrice, setCustomerPrice] = useState(hotel.price || 0);
  const [agentPrice, setAgentPrice] = useState(hotel.agentPrice || 0);
  const [profitMargin, setProfitMargin] = useState(hotel.profitMargin || 0);

  const handleCustomerPriceChange = (value: number) => {
    setCustomerPrice(value);
    const newProfitMargin = value - agentPrice;
    setProfitMargin(newProfitMargin);
  };

  const handleAgentPriceChange = (value: number) => {
    setAgentPrice(value);
    const newProfitMargin = customerPrice - value;
    setProfitMargin(newProfitMargin);
  };

  const handleSave = () => {
    onSave({
      customerPrice,
      agentPrice,
      profitMargin
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Acente Fiyatlandırma - {hotel.name}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Müşteriye Satış Fiyatı (€)
            </label>
            <input
              type="number"
              value={customerPrice}
              onChange={(e) => handleCustomerPriceChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Müşteri fiyatı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acente Alış Fiyatı (€)
            </label>
            <input
              type="number"
              value={agentPrice}
              onChange={(e) => handleAgentPriceChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Acente fiyatı"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Kar Marjı:</span>
              <span className={`text-lg font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                €{profitMargin.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-gray-700">Kar Oranı:</span>
              <span className={`text-lg font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {customerPrice > 0 ? ((profitMargin / customerPrice) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {profitMargin >= 0 ? 'Kârlı' : 'Zararlı'} işlem
            </div>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500"
          >
            İptal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}

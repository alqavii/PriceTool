'use client';

import { useState } from 'react';
import { generatePrice } from '@/lib/gmm';

interface InputSectionProps {
  onAnalyze: (buyPrice: number, sellPrice?: number, friends?: number) => void;
}

export default function InputSection({ onAnalyze }: InputSectionProps) {
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [sellPrice, setSellPrice] = useState<string>('');
  const [friends, setFriends] = useState<string>('0');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const buy = parseFloat(buyPrice);
    const sell = sellPrice ? parseFloat(sellPrice) : undefined;
    const friendCount = parseInt(friends) || 0;

    if (isNaN(buy) || buy <= 0) {
      alert('Please enter a valid buy price greater than 0');
      return;
    }

    if (sell !== undefined && (isNaN(sell) || sell <= 0)) {
      alert('Please enter a valid sell price greater than 0');
      return;
    }

    if (friendCount < 0) {
      alert('Number of friends cannot be negative');
      return;
    }

    onAnalyze(buy, sell, friendCount);
  };

  const handleRandomPrice = () => {
    const randomBuy = generatePrice();
    setBuyPrice(randomBuy.toString());
  };

  return (
    <div className="bg-surface rounded-lg p-6 shadow-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="buyPrice"
              className="block text-sm font-medium mb-2"
            >
              What price can you buy at today?
            </label>
            <input
              type="number"
              id="buyPrice"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              placeholder="e.g., 2000"
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text"
              required
            />
          </div>

          <div>
            <label
              htmlFor="sellPrice"
              className="block text-sm font-medium mb-2"
            >
              What price can you sell for? (optional)
            </label>
            <input
              type="number"
              id="sellPrice"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="e.g., 2500"
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text"
            />
          </div>

          <div>
            <label
              htmlFor="friends"
              className="block text-sm font-medium mb-2"
            >
              How many friends?
            </label>
            <input
              type="number"
              id="friends"
              value={friends}
              onChange={(e) => setFriends(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 bg-background border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-text"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-primary hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-md transition-colors"
          >
            Analyze
          </button>
          <button
            type="button"
            onClick={handleRandomPrice}
            className="bg-surface hover:bg-gray-700 text-text border border-gray-700 font-semibold py-2 px-6 rounded-md transition-colors"
          >
            Random Price
          </button>
        </div>
      </form>
    </div>
  );
}

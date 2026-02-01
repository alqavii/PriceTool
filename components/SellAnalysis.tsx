'use client';

import DistributionChart from './DistributionChart';
import { AnalysisResult } from '@/types/analysis';

interface SellAnalysisProps {
  result: AnalysisResult;
}

export default function SellAnalysis({ result }: SellAnalysisProps) {
  const {
    buyPrice,
    sellPrice,
    profit,
    roi,
    sellPercentile,
    expectedDays,
    probBetter,
  } = result;

  if (!sellPrice || profit === undefined || roi === undefined) {
    return null;
  }

  const getRecommendation = (days: number) => {
    if (days < 2) {
      return {
        text: 'Might be worth waiting!',
        emoji: '✅',
        color: 'text-success',
      };
    } else if (days < 5) {
      return {
        text: 'Borderline - your call',
        emoji: '⚖️',
        color: 'text-warning',
      };
    } else {
      return {
        text: 'Sell now! Not worth waiting',
        emoji: '❌',
        color: 'text-danger',
      };
    }
  };

  const recommendation = expectedDays ? getRecommendation(expectedDays) : null;

  return (
    <div className="bg-surface rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-2xl font-bold">Sell Price Analysis</h2>

      {/* Profit Display */}
      <div className="text-center py-4 border-b border-gray-700">
        <div className="text-lg text-text-secondary mb-2">
          Potential Profit
        </div>
        <div
          className={`text-5xl font-bold mb-2 ${
            profit >= 0 ? 'text-success' : 'text-danger'
          }`}
        >
          {profit >= 0 ? '+' : ''}
          {profit.toFixed(0)}
        </div>
        <div
          className={`text-2xl font-semibold ${
            profit >= 0 ? 'text-success' : 'text-danger'
          }`}
        >
          {roi >= 0 ? '+' : ''}
          {roi.toFixed(1)}% ROI
        </div>
      </div>

      {/* Wait Time Analysis */}
      {expectedDays !== undefined && recommendation && (
        <div className="text-center py-4 border-b border-gray-700">
          <div className="text-text-secondary mb-2">
            Expected wait for better price
          </div>
          <div className="text-4xl font-bold mb-2">
            {expectedDays < 100 ? expectedDays.toFixed(1) : '100+'}
            <span className="text-xl text-text-secondary ml-2">days</span>
          </div>
          <div className={`text-xl font-semibold ${recommendation.color}`}>
            {recommendation.emoji} {recommendation.text}
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="py-4">
        <DistributionChart buyPrice={buyPrice} sellPrice={sellPrice} />
      </div>

      {/* Statistics */}
      <div className="space-y-3 border-t border-gray-700 pt-4">
        {sellPercentile !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">
              Sell price percentile:
            </span>
            <span className="font-semibold">{sellPercentile.toFixed(1)}th</span>
          </div>
        )}

        {probBetter !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-text-secondary">Better prices available:</span>
            <span className="font-semibold">{probBetter.toFixed(1)}%</span>
          </div>
        )}
      </div>

      {/* Info box */}
      <div className="text-sm text-text-secondary bg-background rounded p-3">
        <strong>How to interpret:</strong> The expected wait time shows how many
        days on average you&apos;d need to wait to see a price better than your
        sell price. If it&apos;s high, the current offer is already quite good!
      </div>
    </div>
  );
}

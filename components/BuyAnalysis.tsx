'use client';

import DistributionChart from './DistributionChart';
import { AnalysisResult } from '@/types/analysis';

interface BuyAnalysisProps {
  result: AnalysisResult;
}

export default function BuyAnalysis({ result }: BuyAnalysisProps) {
  const { buyPrice, buyPercentile, lowClusterProb, highClusterProb } = result;

  const getInterpretation = (percentile: number) => {
    if (percentile < 25) {
      return {
        text: 'Great buy!',
        emoji: '🎉',
        description: 'This is in the bottom 25% of prices.',
        color: 'text-success',
      };
    } else if (percentile < 50) {
      return {
        text: 'Good buy!',
        emoji: '👍',
        description: 'This is below average.',
        color: 'text-success',
      };
    } else if (percentile < 75) {
      return {
        text: 'Average buy.',
        emoji: '⚖️',
        description: 'Consider waiting for better.',
        color: 'text-warning',
      };
    } else {
      return {
        text: 'Poor buy.',
        emoji: '⚠️',
        description: 'This is in the top 25% of prices.',
        color: 'text-danger',
      };
    }
  };

  const interpretation = getInterpretation(buyPercentile);
  const probBetter = 100 - buyPercentile;

  return (
    <div className="bg-surface rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-2xl font-bold">Buy Price Analysis</h2>

      {/* Percentile Display */}
      <div className="text-center py-4">
        <div className="text-5xl font-bold mb-2">
          {buyPercentile.toFixed(1)}
          <span className="text-2xl text-text-secondary">th</span>
        </div>
        <div className="text-lg text-text-secondary mb-2">percentile</div>
        <div className={`text-xl font-semibold ${interpretation.color}`}>
          {interpretation.emoji} {interpretation.text}
        </div>
        <div className="text-text-secondary mt-1">
          {interpretation.description}
        </div>
      </div>

      {/* Chart */}
      <div className="py-4">
        <DistributionChart buyPrice={buyPrice} />
      </div>

      {/* Statistics */}
      <div className="space-y-3 border-t border-gray-700 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Better prices available:</span>
          <span className="font-semibold">{probBetter.toFixed(1)}%</span>
        </div>

        {lowClusterProb !== undefined && highClusterProb !== undefined && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">
                Probability from low-price cluster:
              </span>
              <span className="font-semibold">{lowClusterProb.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">
                Probability from high-price cluster:
              </span>
              <span className="font-semibold">{highClusterProb.toFixed(1)}%</span>
            </div>
          </>
        )}
      </div>

      {/* Tooltip */}
      <div className="text-sm text-text-secondary bg-background rounded p-3">
        <strong>What is percentile?</strong> If your price is at the 60th
        percentile, it means 60% of daily prices are worse (higher) than yours,
        and 40% are better (lower).
      </div>
    </div>
  );
}

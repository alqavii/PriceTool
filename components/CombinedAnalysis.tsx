'use client';

import DistributionChart from './DistributionChart';
import WaitTimeChart from './WaitTimeChart';
import { AnalysisResult } from '@/types/analysis';

interface CombinedAnalysisProps {
  result: AnalysisResult;
}

export default function CombinedAnalysis({ result }: CombinedAnalysisProps) {
  const {
    buyPrice,
    sellPrice,
    buyPercentile,
    lowClusterProb,
    highClusterProb,
    profit,
    roi,
    sellPercentile,
    expectedDays,
    probBetter,
    rollsPerDay,
  } = result;

  const getBuyInterpretation = (percentile: number) => {
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

  const getSellRecommendation = (days: number) => {
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

  const buyInterpretation = getBuyInterpretation(buyPercentile);
  const buyProbBetter = 100 - buyPercentile;
  const sellRecommendation = expectedDays ? getSellRecommendation(expectedDays) : null;

  return (
    <div className="bg-surface rounded-lg p-6 shadow-lg space-y-6">
      <h2 className="text-2xl font-bold">Price Analysis</h2>

      {/* Shared Chart */}
      <div className="py-4">
        <DistributionChart buyPrice={buyPrice} sellPrice={sellPrice} />
      </div>

      {/* Wait Time Analysis Chart */}
      <div className="py-4 border-t border-gray-700 pt-6">
        <WaitTimeChart buyPrice={buyPrice} rollsPerDay={rollsPerDay ?? 1} />
      </div>

      {/* Split Analysis Below Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-700 pt-6">
        {/* Buy Analysis Column */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold border-b border-gray-700 pb-2">
            Buy Price Analysis
          </h3>

          {/* Percentile Display */}
          <div className="text-center py-3">
            <div className="text-4xl font-bold mb-1">
              {buyPercentile.toFixed(1)}
              <span className="text-xl text-text-secondary">th</span>
            </div>
            <div className="text-sm text-text-secondary mb-1">percentile</div>
            <div className={`text-lg font-semibold ${buyInterpretation.color}`}>
              {buyInterpretation.emoji} {buyInterpretation.text}
            </div>
            <div className="text-sm text-text-secondary mt-1">
              {buyInterpretation.description}
            </div>
          </div>

          {/* Statistics */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Better prices:</span>
              <span className="font-semibold">{buyProbBetter.toFixed(1)}%</span>
            </div>

            {lowClusterProb !== undefined && highClusterProb !== undefined && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Low-price cluster:</span>
                  <span className="font-semibold">{lowClusterProb.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">High-price cluster:</span>
                  <span className="font-semibold">{highClusterProb.toFixed(1)}%</span>
                </div>
              </>
            )}
          </div>

          {/* Tooltip */}
          <div className="text-xs text-text-secondary bg-background rounded p-2">
            <strong>Percentile:</strong> At {buyPercentile.toFixed(0)}th percentile,{' '}
            {buyPercentile.toFixed(0)}% of prices are worse than yours.
          </div>
        </div>

        {/* Sell Analysis Column */}
        {sellPrice !== undefined && profit !== undefined && roi !== undefined && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-gray-700 pb-2">
              Sell Price Analysis
            </h3>

            {/* Profit Display */}
            <div className="text-center py-3 border-b border-gray-700">
              <div className="text-sm text-text-secondary mb-1">
                Potential Profit
              </div>
              <div
                className={`text-4xl font-bold mb-1 ${
                  profit >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {profit >= 0 ? '+' : ''}
                {profit.toFixed(0)}
              </div>
              <div
                className={`text-xl font-semibold ${
                  profit >= 0 ? 'text-success' : 'text-danger'
                }`}
              >
                {roi >= 0 ? '+' : ''}
                {roi.toFixed(1)}% ROI
              </div>
            </div>

            {/* Wait Time Analysis */}
            {expectedDays !== undefined && sellRecommendation && (
              <div className="text-center py-3 border-b border-gray-700">
                <div className="text-sm text-text-secondary mb-1">
                  Expected wait for better
                </div>
                <div className="text-3xl font-bold mb-1">
                  {expectedDays < 100 ? expectedDays.toFixed(1) : '100+'}
                  <span className="text-lg text-text-secondary ml-1">days</span>
                </div>
                <div className={`text-lg font-semibold ${sellRecommendation.color}`}>
                  {sellRecommendation.emoji} {sellRecommendation.text}
                </div>
                {rollsPerDay !== undefined && rollsPerDay > 1 && (
                  <div className="text-xs text-text-secondary mt-1">
                    With {rollsPerDay} price checks per day
                  </div>
                )}
              </div>
            )}

            {/* Statistics */}
            <div className="space-y-2 text-sm">
              {sellPercentile !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Sell percentile:</span>
                  <span className="font-semibold">{sellPercentile.toFixed(1)}th</span>
                </div>
              )}

              {probBetter !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary">Better prices:</span>
                  <span className="font-semibold">{probBetter.toFixed(1)}%</span>
                </div>
              )}
            </div>

            {/* Info box */}
            <div className="text-xs text-text-secondary bg-background rounded p-2">
              <strong>Wait time:</strong> How many days on average to see a better
              price. High values mean the current offer is good!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

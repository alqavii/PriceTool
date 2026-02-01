'use client';

import { useState } from 'react';
import InputSection from '@/components/InputSection';
import CombinedAnalysis from '@/components/CombinedAnalysis';
import { AnalysisResult } from '@/types/analysis';
import {
  getPercentile,
  expectedDaysToWaitMultiRoll,
  probabilityAboveMultiRoll,
  getComponentProbabilities,
} from '@/lib/gmm';

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );

  const handleAnalyze = (buyPrice: number, sellPrice?: number, friends?: number) => {
    const rollsPerDay = 1 + (friends || 0); // You + friends
    const buyPercentile = getPercentile(buyPrice);
    const componentProbs = getComponentProbabilities(buyPrice);

    const result: AnalysisResult = {
      buyPrice,
      buyPercentile,
      lowClusterProb: componentProbs.lowCluster,
      highClusterProb: componentProbs.highCluster,
      rollsPerDay,
    };

    if (sellPrice !== undefined) {
      const profit = sellPrice - buyPrice;
      const roi = (profit / buyPrice) * 100;
      const sellPercentile = getPercentile(sellPrice);
      const probBetter = probabilityAboveMultiRoll(sellPrice, rollsPerDay);
      const expectedDays = expectedDaysToWaitMultiRoll(sellPrice, rollsPerDay);

      result.sellPrice = sellPrice;
      result.profit = profit;
      result.roi = roi;
      result.sellPercentile = sellPercentile;
      result.probBetter = probBetter;
      result.expectedDays = expectedDays;
    }

    setAnalysisResult(result);
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">
            Asset Price Analyzer
          </h1>
          <p className="text-xl text-text-secondary">
            Make smarter trading decisions
          </p>
        </header>

        {/* Input Section */}
        <InputSection onAnalyze={handleAnalyze} />

        {/* Results */}
        {analysisResult && <CombinedAnalysis result={analysisResult} />}

        {/* Footer */}
        <footer className="text-center text-text-secondary text-sm py-8">
          <p>
            Using Gaussian Mixture Model (GMM) for statistical price analysis
          </p>
        </footer>
      </div>
    </div>
  );
}

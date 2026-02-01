import { DISTRIBUTION_PARAMS } from './constants';

// Box-Muller transform for generating normal distribution random numbers
export function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

// Generate random price using GMM
export function generatePrice(): number {
  const roll = Math.random();
  let price: number;

  if (roll < DISTRIBUTION_PARAMS.component2.weight) {
    // High price cluster (jackpot)
    price = randomNormal(
      DISTRIBUTION_PARAMS.component2.mean,
      DISTRIBUTION_PARAMS.component2.stdDev
    );
  } else {
    // Normal price cluster
    price = randomNormal(
      DISTRIBUTION_PARAMS.component1.mean,
      DISTRIBUTION_PARAMS.component1.stdDev
    );
  }

  return Math.max(0, Math.round(price));
}

// Normal distribution PDF (Probability Density Function)
export function normalPDF(x: number, mean: number, stdDev: number): number {
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
  return coefficient * Math.exp(exponent);
}

// Error function approximation (Abramowitz and Stegun)
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * x);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

// Normal distribution CDF (Cumulative Distribution Function)
export function normalCDF(x: number, mean: number, stdDev: number): number {
  return 0.5 * (1 + erf((x - mean) / (stdDev * Math.sqrt(2))));
}

// GMM PDF - probability density at price x
export function pdfGMM(x: number): number {
  const w1 = DISTRIBUTION_PARAMS.component1.weight;
  const w2 = DISTRIBUTION_PARAMS.component2.weight;
  const mu1 = DISTRIBUTION_PARAMS.component1.mean;
  const sigma1 = DISTRIBUTION_PARAMS.component1.stdDev;
  const mu2 = DISTRIBUTION_PARAMS.component2.mean;
  const sigma2 = DISTRIBUTION_PARAMS.component2.stdDev;

  return w1 * normalPDF(x, mu1, sigma1) + w2 * normalPDF(x, mu2, sigma2);
}

// GMM CDF - cumulative probability up to price x
export function cdfGMM(x: number): number {
  const w1 = DISTRIBUTION_PARAMS.component1.weight;
  const w2 = DISTRIBUTION_PARAMS.component2.weight;
  const mu1 = DISTRIBUTION_PARAMS.component1.mean;
  const sigma1 = DISTRIBUTION_PARAMS.component1.stdDev;
  const mu2 = DISTRIBUTION_PARAMS.component2.mean;
  const sigma2 = DISTRIBUTION_PARAMS.component2.stdDev;

  return w1 * normalCDF(x, mu1, sigma1) + w2 * normalCDF(x, mu2, sigma2);
}

// Calculate percentile (what % of prices are below this value)
export function getPercentile(price: number): number {
  return cdfGMM(price) * 100;
}

// Calculate probability of getting price >= target
export function probabilityAbove(targetPrice: number): number {
  return (1 - cdfGMM(targetPrice)) * 100;
}

// Expected number of days to wait for better price
export function expectedDaysToWait(targetPrice: number): number {
  const probBetter = 1 - cdfGMM(targetPrice);
  if (probBetter <= 0) return Infinity;
  return 1 / probBetter;
}

// Calculate which component (cluster) contributes more to this price
export function getComponentProbabilities(price: number): {
  lowCluster: number;
  highCluster: number;
} {
  const mu1 = DISTRIBUTION_PARAMS.component1.mean;
  const sigma1 = DISTRIBUTION_PARAMS.component1.stdDev;
  const mu2 = DISTRIBUTION_PARAMS.component2.mean;
  const sigma2 = DISTRIBUTION_PARAMS.component2.stdDev;
  const w1 = DISTRIBUTION_PARAMS.component1.weight;
  const w2 = DISTRIBUTION_PARAMS.component2.weight;

  const pdf1 = normalPDF(price, mu1, sigma1);
  const pdf2 = normalPDF(price, mu2, sigma2);

  const totalPDF = w1 * pdf1 + w2 * pdf2;

  return {
    lowCluster: (w1 * pdf1) / totalPDF * 100,
    highCluster: (w2 * pdf2) / totalPDF * 100,
  };
}

// Calculate probability of getting at least one price >= target with multiple rolls per day
// rollsPerDay = 1 + number of friends (you + friends)
export function probabilityAboveMultiRoll(targetPrice: number, rollsPerDay: number): number {
  const singleRollProb = 1 - cdfGMM(targetPrice);
  // Probability that at least one roll out of N is better than target
  // = 1 - P(all rolls are worse)
  // = 1 - P(single roll worse)^N
  const probAtLeastOne = 1 - Math.pow(1 - singleRollProb, rollsPerDay);
  return probAtLeastOne * 100;
}

// Expected number of days to wait for better price with multiple rolls per day
export function expectedDaysToWaitMultiRoll(targetPrice: number, rollsPerDay: number): number {
  const probBetterPerDay = probabilityAboveMultiRoll(targetPrice, rollsPerDay) / 100;
  if (probBetterPerDay <= 0) return Infinity;
  return 1 / probBetterPerDay;
}

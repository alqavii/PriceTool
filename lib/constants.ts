// Distribution Parameters for Gaussian Mixture Model (GMM)
export const DISTRIBUTION_PARAMS = {
  component1: {
    weight: 0.779, // 77.9% probability - normal price cluster
    mean: 1691, // Average price for normal cluster
    stdDev: 606, // Standard deviation
  },
  component2: {
    weight: 0.221, // 22.1% probability - high price cluster (jackpot)
    mean: 3742, // Average price for high cluster
    stdDev: 714, // Standard deviation
  },
  overall: {
    min: 500, // Reasonable minimum for chart
    max: 5100, // Reasonable maximum for chart
    mean: 2144, // Overall mean
    stdDev: 1060, // Overall std dev
  },
};

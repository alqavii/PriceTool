export interface AnalysisResult {
  buyPrice: number;
  sellPrice?: number;
  buyPercentile: number;
  sellPercentile?: number;
  profit?: number;
  roi?: number;
  expectedDays?: number;
  probBetter?: number;
  lowClusterProb?: number;
  highClusterProb?: number;
  rollsPerDay?: number;
}

export interface ChartData {
  labels: number[];
  pdfValues: number[];
}

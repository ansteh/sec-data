enum RecommendationType {
  BUY = 'BUY',
  HOLD = 'HOLD',
  SELL = 'SELL',
}

export interface RecommendationAlgorithm {
  signal(productId: number | string): RecommendationType;
};

export interface FinancialStatements {
  getScore(productId: number | string): number;
  getRecommendation(productId: number | string): RecommendationType;
};
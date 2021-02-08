import { Product } from './products';
import { Portfolio } from './portfolio';
import { FinancialStatements } from './financial-statements';

export interface PortfolioAgent {
  // portfolio: Portfolio;
  // statements: FinancialStatements;
  
  setPortfolio(portfolio: Portfolio): void;
  setStatements(statements: FinancialStatements): void;
  trade(): Promise<any>;
};
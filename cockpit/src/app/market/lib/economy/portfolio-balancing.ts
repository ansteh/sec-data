import { Product } from './interfaces/products';
import { Portfolio } from './interfaces/portfolio';
import { Economy, createEconomy } from './economy';
import { FinancialStatements } from './interfaces/financial-statements';
import { PortfolioAgent } from './interfaces/portfolio-agent';

export interface SimulationSettings {
  economy: Economy;
};

export interface PortfolioBalancing {
  addPortfolioAgent(portfolioAgent: PortfolioAgent): void;
  trade(): void;
};

export const createPortfolioBalancing = ({
  economy: Economy,
}: SimulationSettings): PortfolioBalancing => {
  
  const portfolioAgents: Array<PortfolioAgent> = [];
  
  const addPortfolioAgent = (portfolioAgent: PortfolioAgent) => {
    portfolioAgents.push(portfolioAgent);
  };
  
  const trade = (): Promise<any> => {
    return Promise.all(portfolioAgents.map(agent => agent.trade()));
  };
  
  return {
    addPortfolioAgent,
    trade,
  };
};

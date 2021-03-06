import * as Dictionary from './dictionary';
import * as _ from 'lodash';

import { getCAGR, getUps, growthRate } from '../formulas/growth';
import { devide, getAllEntries, getValues, map } from './util';

import { getValuations } from './pricing';

const inspectRetainedEarnings = (data) => {
  const netIncome = getValues('incomeStatement.netIncome', data);
  const retainedEarnings = getValues('balanceSheet.retainedEarnings', data);
  const commonDividendsPaid = getValues('cashflowStatement.commonDividendsPaid', data);
  const repurchaseOfCommonStock = getValues('cashflowStatement.repurchaseOfCommonStock', data);

  const treasuryStock	 = getValues('balanceSheet.treasuryStock', data);
  const treasuryStockAndOther	 = getValues('balanceSheet.treasuryStockAndOther', data);
  const totalTreasuryStock = map([treasuryStock, treasuryStockAndOther], ([a, b]) => { return a+b; });

  const input = [
    netIncome,
    repurchaseOfCommonStock,
    retainedEarnings,
    commonDividendsPaid,
    totalTreasuryStock,
  ];

  const calculatedRetainedEarnings = map(input, (values, index) => {
    if(index === 0) return;

    const [
      netIncome,
      repurchaseOfCommonStock,
      currentRetainedEarnings,
      commonDividendsPaid,
      currentTotalTreasuryStock,
    ] = values;

    const previousRetainedEarnings = retainedEarnings[index-1];
    // const treasuryChange = currentTotalTreasuryStock - totalTreasuryStock[index-1];
    // console.log('treasuryChange', treasuryChange);

    const value = previousRetainedEarnings + netIncome + repurchaseOfCommonStock + commonDividendsPaid;

    const stats: any = {
      value,
      should: currentRetainedEarnings,
    };

    stats.rate = _.round((stats.value/stats.should - 1) * 100, 2);
    stats.difference = stats.value-stats.should;

    return stats;
  });

  console.log('calculatedRetainedEarnings', JSON.stringify(_.tail(calculatedRetainedEarnings), null, 2));
};

export const getIncomeMargins = (data) => {
  // console.log('data', data, getAllEntries(data));
  console.log('AltmanZScore', Dictionary.getAltmanZScore(data));

  const revenue = getValues('incomeStatement.revenue', data);
  const grossProfit = getValues('incomeStatement.grossProfit', data);
  const researchAndDevelopment = getValues('incomeStatement.researchAndDevelopment', data);
  const sgaExpense = getValues('incomeStatement.sellingGeneralAndAdministrativeExpense', data);
  const depreciationAndAmortization = getValues('incomeStatement.depreciationAndAmortization', data);
  const operatingIncome = getValues('incomeStatement.operatingIncome', data);
  const interestExpense = getValues('incomeStatement.interestExpense', data);
  const netIncome = getValues('incomeStatement.netIncome', data);
  const preTaxIncome = getValues('incomeStatement.preTaxIncome', data);
  const paidTax = map([preTaxIncome, netIncome], ([a, b]) => { return a-b; });
  const dilutedEPS = getValues('incomeStatement.dilutedEPS', data);

  const cashAndEquivalents = getValues('balanceSheet.cashAndEquivalents', data);
  const inventory = getValues('balanceSheet.inventory', data);
  const accountsReceivableNet = getValues('balanceSheet.accountsReceivableNet', data);
  const totalCurrentAssets = getValues('balanceSheet.totalCurrentAssets', data);
  const plantPropertyAndEquipmentNet = getValues('balanceSheet.plantPropertyAndEquipmentNet', data);
  const goodwill = getValues('balanceSheet.goodwill', data);

  const shortTermBorrowings = getValues('balanceSheet.shortTermBorrowings', data);
  const longTermDebtDue = getValues('balanceSheet.longTermDebtDue', data);
  const totalCurrentLiabilities = getValues('balanceSheet.totalCurrentLiabilities', data);
  const quickRatio = Dictionary.getQuickRatio(data);

  const retainedEarnings = getValues('balanceSheet.retainedEarnings', data);

  const totalEquity = getValues('balanceSheet.totalEquity', data);
  const longTermDebt = getValues('balanceSheet.longTermDebt', data);
  const totalLiabilities = getValues('balanceSheet.totalLiabilities', data);
  const totalAssets = getValues('balanceSheet.totalAssets', data);
  const tangibleCommonEquity = Dictionary.getTangibleCommonEquity(data);

  const commonDividendsPaid = getValues('cashflowStatement.commonDividendsPaid', data);
  const repurchaseOfCommonStock = getValues('cashflowStatement.repurchaseOfCommonStock', data);
  const cashFromOperations = getValues('cashflowStatement.cashFromOperations', data);

  const totalShortTermDebt = map([shortTermBorrowings, longTermDebtDue], ([a, b]) => { return a+b; });
  const totalDebt = map([totalShortTermDebt, longTermDebt], ([a, b]) => { return a+b; });
  const treasuryShareAdjustedTotalEquity = map([totalEquity, repurchaseOfCommonStock], ([a, b]) => { return a-b; });

  // inspectRetainedEarnings(data);

  const weightedAverageDilutedSharesOutstanding = getValues('incomeStatement.weightedAverageDilutedSharesOutstanding', data);
  const capitalExpenditures = getValues('cashflowStatement.capitalExpenditures', data);
  const capitalExpendituresPerShare = map([capitalExpenditures, weightedAverageDilutedSharesOutstanding], ([a, b]) => {
    return !b ? 0 : (-a)/b;
  });

  const freeCashFlow = Dictionary.getFreeCashFlow(data);

  // TODO: (29) - Property, Plant and Equipment - do not spend a ton of money
  // TODO: (30) - Goodwill - bought durable or medicore businesses - increase over a number of years => assume buying companies
  // TODO: (31) - intangables - internally created assets are not included => hidden value especially for big brand names
  // TODO: (32) - Long-term investments - investments carried on the books at cost or market price, whichever is lower => hidden value
  // TODO: (34) - Return on Total Assets - market cap should be high enough to avoid entry of new competitors due to higher entry costs
  // TODO: (42) - fix formula for treasuryShareAdjustedTotalEquity
  // TODO: (45) - Retained Earnings (resolve by buybacks)
  // TODO: (49) - Leverage assessment

  // TODO: metrify leverage by debt (49)

  const valuations = getValuations(data);

  return {
    incomeStatement: {
      grossProfit: {
        label: 'Gross Profit Margin (% Revenue)',
        values: map([grossProfit, revenue], ([a, b]) => { return a/b; }),
      },
      researchAndDevelopment: {
        label: 'Research and Development (% Gross Profit)',
        values: map([researchAndDevelopment, grossProfit], ([a, b]) => { return -a/b; }),
      },
      sellingGeneralAndAdministrativeExpense: {
        label: 'SGA (% Gross Profit)',
        values: map([sgaExpense, grossProfit], ([a, b]) => { return -a/b; }),
      },
      depreciationAndAmortization: {
        label: 'Depreciation & Amortization (% Gross Profit)',
        values: map([depreciationAndAmortization, grossProfit], ([a, b]) => { return -a/b; }),
      },
      operatingIncome: {
        label: 'Operating Income (% Gross Profit)',
        values: map([operatingIncome, grossProfit], ([a, b]) => { return a/b; }),
      },
      interestExpense: {
        label: 'Interest Expense (% Operating Income)',
        values: map([interestExpense, operatingIncome], ([a, b]) => { return -a/b; }),
      },
      netIncome: {
        label: 'Net Income (% Revenue)',
        values: map([netIncome, revenue], ([a, b]) => { return a/b; }),
      },
      paidTax: {
        label: 'Paid Tax (Before Tax Income - Net Income)',
        values: paidTax,
      },
      paidTaxRate: {
        label: 'Taxed Income Rate (% Before Tax Income)',
        values: map([paidTax, preTaxIncome], devide),
      },
      operatingIncomeGrowthRate: {
        label: 'Operating Income (% Net Income)',
        values: growthRate(operatingIncome),
      },
      netIncomeGrowthRate: {
        label: 'Net Income (% Rate)',
        values: growthRate(netIncome),
      },
    },
    balanceSheet: {
      cashAndEquivalentsToOperatingEarningsRatio: {
        label: 'Cash And Equivalents to Operating Earnings Ratio',
        values: map([cashAndEquivalents, operatingIncome], devide),
      },
      inventoryToOperatingEarningsRatio: {
        label: 'Inventory to Operating Earnings Ratio',
        values: map([inventory, operatingIncome], devide),
      },
      accountsReceivableNetToRevenueRatio: {
        label: 'Inventory to Operating Earnings Ratio',
        values: map([accountsReceivableNet, revenue], devide),
      },
      currentRatio: {
        label: 'Current Ratio',
        values: map([totalCurrentAssets, totalCurrentLiabilities], devide),
      },
      quickRatio: {
        label: 'Quick Ratio',
        values: quickRatio,
      },
      shortToLongDebtRatio: {
        label: 'Short Term Debt to Long Term Debt Ratio',
        values: map([shortTermBorrowings, longTermDebt], devide),
      },
      totalShortToLongDebtRatio: {
        label: 'Total Short Term Debt to Long Term Debt Ratio',
        values: map([totalShortTermDebt, longTermDebt], devide),
      },
      yearsToPayoffLongTermDebt: {
        label: 'Years to payoff Long Term Debt',
        values: map([netIncome, longTermDebt], ([a, b]) => Dictionary.getYearsToPayoffLongTermDebt(a, b)),
      },
      returnOnAssetRatio: {
        label: 'Return on Asset Ratio',
        values: map([netIncome, totalAssets], devide),
      },
      totalDebt: {
        label: 'Total Debt',
        values: totalDebt,
      },
      totalDebtToEquity: {
        label: 'Total Debt to Equity Ratio',
        values: map([totalLiabilities, totalEquity], devide),
      },
      treasuryShareAdjustedDebtToEquity: {
        label: 'Treasury share-adjusted Total Debt to Equity Ratio',
        values: map([totalLiabilities, treasuryShareAdjustedTotalEquity], devide),
      },
      retainedEarningsGrowthRate: {
        label: 'Retained Earnings (% Rate)',
        values: growthRate(retainedEarnings),
      },
      returnOnEquity: {
        label: 'Return on Equity (ROE)',
        values: map([netIncome, totalEquity], devide),
      },
      treasuryShareAdjustedReturnOnEquity: {
        label: 'Treasury share-adjusted Return on Equity (ROE)',
        values: map([netIncome, treasuryShareAdjustedTotalEquity], devide),
      },
      netIncomeToTangibleCommonEquity: {
        label: 'Net Income To Tangible Common Equity Ratio (TCE / net tangible equity capital)',
        values: map([netIncome, tangibleCommonEquity], devide),
      },
    },
    cashflowStatement: {
      capitalExpendituresPerShare: {
        label: 'Capital Expenditures Per Share',
        values: capitalExpendituresPerShare,
      },
      capitalExpendituresToEarnings: {
        label: 'Capital Expenditures to Earnings Ration',
        values: map([capitalExpenditures, netIncome], ([a, b]) => { return !b ? 0 : (-a)/b; }),
      },
      capitalExpendituresToEarningsOver10Years: { // durable competitive advantage: good place to look (>= 50%) more than likely (>= 25%)
        label: 'Capital Expenditures to Earnings Over 10 Years',
        values: [Dictionary.getCapitalExpendituresToEarningsOver10Years(data)],
      },
      repurchaseOfCommonStockToOperatingActivities: {
        label: 'Repurchase Of Common Stock To Operating Activities',
        values: map([_.map(repurchaseOfCommonStock, value => -value || 0), cashFromOperations], devide),
      },
      freeCashFlow: {
        label: 'Free Cash Flow',
        values: freeCashFlow,
      },
      freeCashFlowPerShare: {
        label: 'Free Cash Flow Per Share',
        values: Dictionary.getFreeCashFlowPerShare(data),
      },
      yearsToPayoffLongTermDebtViaFreeCashFlow: {
        label: 'Years to payoff Long Term Debt via Free Cash Flow',
        values: map([freeCashFlow, longTermDebt], ([a, b]) => Dictionary.getYearsToPayoffLongTermDebt(a, b)),
      },
    },
    other: {
      operatingIncomeToPlantPropertyAndEquipmentNet: {
        label: 'Operating Income to Plant Property and Equipment',
        values: map([operatingIncome, plantPropertyAndEquipmentNet], devide),
      },
      totalDebtToPlantPropertyAndEquipmentNet: {
        label: 'Total Debt to Plant Property and Equipment',
        values: map([totalDebt, plantPropertyAndEquipmentNet], devide),
      },
    },
    // fundamental: {
    //   altmanZScore: {
    //     label: 'Altman Z-Score',
    //     values: Dictionary.getAltmanZScore(data),
    //   },
    // },
    valuations,
  };
};

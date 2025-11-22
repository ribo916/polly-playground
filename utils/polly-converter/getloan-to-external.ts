/* eslint-disable @typescript-eslint/no-explicit-any */

/* getloan-to-external.ts
 * ------------------------------------------------------
 * Converts Loan Service ApiLoan → External PricingScenarioRequest
 * Fully self-contained. No external helpers. No shared.ts.
 */

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const toDecimalStringOrNull = (val: unknown): string | null => {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return val.toFixed(4).replace(/\.?0+$/, '');
    return String(val);
  };
  
  const toDecimalStringOrUndefined = (val: unknown): string | undefined => {
    const v = toDecimalStringOrNull(val);
    return v === null ? undefined : v;
  };
  
  const parseDecimal = (val: unknown): number | null => {
    if (val === null || val === undefined || val === '') return null;
    const num = typeof val === 'number' ? val : parseFloat(String(val));
    return Number.isNaN(num) ? null : num;
  };
  
  const normalizeEnumKey = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    return String(value).trim().toUpperCase().replace(/\s+/g, '_');
  };
  
  const mapEnumNormalized = (
    value: unknown,
    map: Record<string, string>
  ): string | undefined => {
    const key = normalizeEnumKey(value);
    if (!key) return undefined;
    return map[key] ?? undefined;
  };
  
  const screamingToPascal = (value: unknown): string | undefined => {
    const key = normalizeEnumKey(value);
    if (!key) return undefined;
    return key
      .toLowerCase()
      .split('_')
      .filter(Boolean)
      .map(part => part[0].toUpperCase() + part.slice(1))
      .join('');
  };
  
  /* ------------------------------------------------------------------ */
  /* ENUM TABLES (Loan → Pricing)                                      */
  /* ------------------------------------------------------------------ */
  
  const LOAN_AUS_TO_PRICING_AUS: Record<string, string> = {
    NONE: 'None',
    MANUAL: 'Manual',
    DU: 'DU',
    LP: 'LP',
    OTHER: 'Other',
    NOT_SPECIFIED: 'NotSpecified'
  };
  
  const LOAN_IMPOUND_TYPE_TO_PRICING_IMPOUNDS: Record<string, string> = {
    NONE: 'None',
    PARTIAL: 'Partial',
    FULL: 'Full'
  };
  
  const LOAN_OCCUPANCY_TO_PRICING_OCCUPANCY: Record<string, string> = {
    PRIMARY: 'PrimaryResidence',
    SECONDARY: 'SecondHome',
    INVESTMENT: 'InvestmentProperty'
  };
  
  const LOAN_PROPERTY_TYPE_TO_PRICING_PROPERTY_TYPE: Record<string, string> = {
    SFR: 'SFR',
    CONDO: 'Condominium',
    PUD: 'PUD',
    MOBILE: 'Mobile',
    MULTI_UNIT: 'TwoFourUnit',
    COOP: 'Cooperative',
    TOWNHOME: 'Townhome',
    MULTI_FAMILY: 'Multifamily',
    COMMERCIAL: 'Commercial',
    MIXED_USE: 'MixedUse',
    FARM: 'Farm',
    HOME_BUSINESS: 'HomeAndBusiness',
    LAND: 'Land',
    MANUFACTURED_SINGLE: 'ManufacturedSingleWide',
    MANUFACTURED_DOUBLE: 'ManufacturedDoubleWide'
  };
  
  const LOAN_STREAMLINE_TO_PRICING_STREAMLINE: Record<string, string> = {
    NONE: 'None',
    NO_CASHOUT_STREAMLINED_REFINANCE: 'NoCashoutStreamlinedRefinance',
    NO_CASHOUT_FHA_STREAMLINED_REFINANCE: 'NoCashoutFHAStreamlinedRefinance'
  };
  
  const LOAN_BUYDOWN_TO_PRICING_BUYDOWN: Record<string, string> = {
    NONE: 'None',
    THREE_TWO_ONE: 'ThreeTwoOne',
    TWO_ONE: 'TwoOne',
    ONE_ONE: 'OneOne',
    ONE_ZERO: 'OneZero'
  };
  
  const LOAN_PURPOSE_TO_PRICING_PURPOSE: Record<string, string> = {
    PURCHASE: 'Purchase',
    NO_CASH_OUT_REFINANCE: 'NoCashOutRefinance',
    CASH_OUT_REFINANCE: 'CashOutRefinance',
    REFINANCE: 'Refinance',
    CONSTRUCTION: 'Construction',
    CONSTRUCTION_PERM: 'ConstructionPerm',
    OTHER: 'Other'
  };
  
  const LOAN_VERIFICATION_METHOD_TO_PRICING_VERIFICATION: Record<string, string> = {
    FULL: 'FullDocument',
    BANK_STATEMENT: 'BankStatement',
    VOE: 'VOE',
    ASSET_QUALIFICATION: 'AssetQualification',
    '1099': 'Method1099',
    DSCR: 'DSCR',
    CPAP_AND_L: 'CPAPAndL'
  };
  
  /* ------------------------------------------------------------------ */
  /* BUILDERS                                                           */
  /* ------------------------------------------------------------------ */
  
  const buildPricingBorrowerFromLoan = (loanData: any) => {
    const b = loanData?.borrower || {};
    const incomeMonthlyNum = parseDecimal(b.incomeMonthly);
    const annualIncome =
      incomeMonthlyNum !== null ? Math.round(incomeMonthlyNum * 12) : undefined;
  
    const verificationMethod =
      mapEnumNormalized(b.verificationMethod, LOAN_VERIFICATION_METHOD_TO_PRICING_VERIFICATION) ??
      undefined;
  
    return {
      firstName: b.firstName || '',
      lastName: b.lastName || '',
      fico: b.fico ?? null,
      dtiRatio: toDecimalStringOrUndefined(b.dtiRatio),
      monthsOfReserves: b.monthsOfReserves ?? 0,
      isNonOccupancyBorrower: b.isNonOccupancyBuyer ?? false,
      isNonOccupancyCoborrower: b.isNonOccupancyCoborrower ?? false,
      propertiesOwned: b.propertiesOwned ?? 0,
      isSelfEmployed: b.isSelfEmployed ?? false,
      multipleBorrowerPairs: b.multipleBorrowerPairs ?? false,
      verificationMethod,
      creditGrade: b.creditGrade || undefined,
      isNonTraditionalCredit: b.isNonTraditionalCredit ?? false,
      isGiftFunds: b.isGiftFunds ?? false,
      isFirstTimeHomeBuyer: b.isFirstTimeHomeBuyer ?? false,
      fullDocMonths: b.fullDocMonths ?? 0,
      cpaPandLMonths: b.cpaPandLMonths ?? 0,
      annualIncome: annualIncome ?? 0
    };
  };
  
  const buildPricingLoanFromLoan = (loanData: any) => {
    const aus = mapEnumNormalized(loanData.aus, LOAN_AUS_TO_PRICING_AUS);
    const impounds = mapEnumNormalized(loanData.impoundType, LOAN_IMPOUND_TYPE_TO_PRICING_IMPOUNDS);
    const streamline = mapEnumNormalized(
      loanData.streamlineRefinanceType,
      LOAN_STREAMLINE_TO_PRICING_STREAMLINE
    );
    const buydown = mapEnumNormalized(
      loanData.temporaryBuydownType,
      LOAN_BUYDOWN_TO_PRICING_BUYDOWN
    );
  
    return {
      amount: toDecimalStringOrUndefined(loanData.amount),
      purchasePrice: toDecimalStringOrUndefined(loanData.purchasePrice),
      propertyValue: toDecimalStringOrUndefined(
        loanData.propertyValue ?? loanData.purchasePrice
      ),
  
      fhaTotalLoanAmount: toDecimalStringOrUndefined(loanData.fhaTotalLoanAmount),
      fhaMortgageInsurancePremium: toDecimalStringOrUndefined(
        loanData.fhaMortgageInsurancePremiumPercentage
      ),
      fhaMortgageInsurancePremiumAmount: toDecimalStringOrUndefined(
        loanData.fhaMortgageInsurancePremiumAmount
      ),
      fhaFinanceAmount: toDecimalStringOrUndefined(loanData.fhaFinancedAmount),
      fhaFinancingOption: screamingToPascal(loanData.fhaFinancingOption),
      fhaPriorEndorsementDate: loanData.fhaCaseAssignmentDate || undefined,
  
      usdaTotalLoanAmount: toDecimalStringOrUndefined(loanData.usdaTotalLoanAmount),
      usdaGuaranteeFeeAmount: toDecimalStringOrUndefined(loanData.usdaGuaranteeFeeAmount),
      usdaGuaranteeFee: toDecimalStringOrUndefined(loanData.usdaGuaranteedPercentage),
      usdaFinanceAmount: toDecimalStringOrUndefined(loanData.usdaFinancedAmount),
      usdaFinancingOption: screamingToPascal(loanData.usdaFinancingOption),
  
      vaTotalLoanAmount: toDecimalStringOrUndefined(loanData.vaTotalLoanAmount),
      vaDownPaymentAmount: toDecimalStringOrUndefined(loanData.vaDownPaymentAmount),
      vaDownPayment: toDecimalStringOrUndefined(loanData.vaDownPayment),
      vaFundingFeeAmount: toDecimalStringOrUndefined(loanData.vaFundingFeeAmount),
      vaFundingFee: toDecimalStringOrUndefined(loanData.vaFundingFeePercentage),
      vaFinanceAmount: toDecimalStringOrUndefined(loanData.vaFinancedAmount),
      vaFinancingOption: screamingToPascal(loanData.vaFinancingOption),
      vaLoanHistory: screamingToPascal(loanData.vaLoanHistory),
      vaCashoutLTV: toDecimalStringOrUndefined(loanData.vaCashoutLtv),
      vaCashoutCLTV: toDecimalStringOrUndefined(loanData.vaCashoutCltv),
      vaCashoutHCLTV: toDecimalStringOrUndefined(loanData.vaCashoutHcltv),
      vaFundingFeeExempt: loanData.isVaFundingFeeExempt ?? false,
  
      isMortgageInsurancePaidByBorrower:
        loanData.isMortgageInsurancePaidByBorrower !== false,
      impounds: impounds || 'Full',
  
      ltv: toDecimalStringOrUndefined(loanData.ltv),
      cltv: toDecimalStringOrUndefined(loanData.cltv),
      hcltv: toDecimalStringOrUndefined(loanData.hcltv),
  
      cashOutAmount: toDecimalStringOrUndefined(loanData.cashOutAmount),
      secondAmount: toDecimalStringOrUndefined(loanData.secondAmount),
      helocLineAmount: toDecimalStringOrUndefined(loanData.helocLineAmount),
      helocDrawAmount: toDecimalStringOrUndefined(loanData.helocDrawAmount),
  
      lenderFee: toDecimalStringOrUndefined(loanData.lenderFee),
      rollLenderFee: loanData.rollLenderFee ?? null,
      prepaymentPenaltyPeriodMonths: loanData.prepaymentPenaltyPeriodMonths ?? null,
      prepaymentPenaltyStructure: screamingToPascal(loanData.prepaymentPenaltyStructure),
      prepaymentPenaltyStructureType: screamingToPascal(
        loanData.prepaymentPenaltyStructureType
      ),
      aus: aus || 'NotSpecified',
      position: screamingToPascal(loanData.position) || 'First',
      isSecondCommunityLoan: loanData.isSecondCommunityLoan ?? null,
      isSecondPiggyBack: loanData.isSecondPiggyback ?? null,
      isSecondInvestorSameAsFirst: loanData.isSecondInvestorSameAsFirst ?? null,
      streamlineRefinanceType: streamline || 'None',
      temporaryBuydownType: buydown || 'None',
  
      loanTerm: loanData.loanTerm ?? null,
      loanType: screamingToPascal(loanData.loanType)
    };
  };
  
  const buildPricingPropertyFromLoan = (loanData: any) => {
    const p = loanData?.property || {};
  
    const occupancy = mapEnumNormalized(p.occupancy, LOAN_OCCUPANCY_TO_PRICING_OCCUPANCY);
    const propertyType = mapEnumNormalized(
      p.propertyType,
      LOAN_PROPERTY_TYPE_TO_PRICING_PROPERTY_TYPE
    );
  
    return {
      estimatedValue: toDecimalStringOrUndefined(p.estimatedValue),
      appraisedValue: toDecimalStringOrUndefined(p.appraisedValue),
      propertyType: propertyType || 'SFR',
      occupancy: occupancy || 'PrimaryResidence',
      units: p.units ?? 1,
      stories: p.stories ?? 1,
      state: p.state || '',
      county: p.county || '',
      countyFipsCode: p.countyFipsCode || '',
      zipCode: p.zipCode || '',
      zipCodePlusFour: p.zipCodePlusFour || undefined,
      lotSizeInAcres: toDecimalStringOrUndefined(p.lotSizeInAcres),
      isNonWarrantableProject: p.isNonWarrantableProject ?? null,
      isCondotel: p.isCondotel ?? null,
      isDecliningMarket: p.isDecliningMarket ?? null,
      inspectionWaiver: p.inspectionWaiver ?? false,
      isHighCostCounty: p.isHighCostCounty ?? null,
      medianIncome: toDecimalStringOrUndefined(p.medianIncome),
      addressLine1: p.addressLine1 || '',
      addressLine2: p.addressLine2 || '',
      city: p.city || ''
    };
  };
  
  const buildPricingBrokerCompFromLoan = (loanData: any) => {
    const bc = loanData?.brokerCompPlan || {};
    return {
      fixedAmount: toDecimalStringOrUndefined(bc.fixedAmount),
      percent: toDecimalStringOrUndefined(bc.percent),
      minAmount: toDecimalStringOrUndefined(bc.minAmount),
      maxAmount: toDecimalStringOrUndefined(bc.maxAmount),
      calculatedAdjustment: toDecimalStringOrUndefined(bc.calculatedAdjustment),
      calculatedAmount: toDecimalStringOrUndefined(bc.calculatedAmount),
      paidBy: bc.paidBy || 'Lender'
    };
  };
  
  /* ------------------------------------------------------------------ */
  /* EXPORT MAIN CONVERTER                                              */
  /* ------------------------------------------------------------------ */
  
  export function getLoanToExternalPricingScenario(loanData: any) {
    const purpose =
      mapEnumNormalized(loanData.purpose, LOAN_PURPOSE_TO_PRICING_PURPOSE) ??
      undefined;
  
    return {
      audienceId: 'Retail',
      purpose,
      borrower: buildPricingBorrowerFromLoan(loanData),
      loan: buildPricingLoanFromLoan(loanData),
      property: buildPricingPropertyFromLoan(loanData),
      brokerCompPlan: buildPricingBrokerCompFromLoan(loanData),
  
      customValues: loanData.customValues
        ? Object.entries(loanData.customValues).map(([name, value]) => ({
            name,
            value
          }))
        : []
    };
  }
  
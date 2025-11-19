/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

// Polly API JSON Converter
// ------------------------------------------------------
// This file handles schema translation between:
// 1) UI / PE3 request shape (pricing-scenario UI payload)
// 2) External QuoteScenarioRequest (pricing API)
// 3) Loan Service ApiLoan (getLoan response)
//
// Design choices:
//
// - Swagger is the source of truth.
// - Both Loan and Pricing use string decimals (`type: string`, `format: decimal`).
// - Loan enums are SCREAMING_SNAKE_CASE.
// - Pricing enums are PascalCase.
// - Loan → Pricing should produce valid QuoteScenarioRequest payloads.
// - UI → Pricing and Pricing → Loan are "best-effort" helpers for your playground.

/* ------------------------------------------------------------------ */
/* Basic helpers                                                       */
/* ------------------------------------------------------------------ */

// Convert a value to a string decimal, or null if not representable.
// Used for fields with `type: string`, `format: decimal`.
const toDecimalStringOrNull = (val: any): string | null => {
  if (val === null || val === undefined || val === '') return null;

  if (typeof val === 'string') {
    // Assume upstream formatting is already acceptable
    return val;
  }

  if (typeof val === 'number') {
    // Reasonable decimal string; trim trailing zeros
    return val.toFixed(4).replace(/\.?0+$/, '');
  }

  // Fallback: stringify whatever we got
  return String(val);
};

// Same as above, but returns `undefined` instead of `null`.
const toDecimalStringOrUndefined = (val: any): string | undefined => {
  const v = toDecimalStringOrNull(val);
  return v === null ? undefined : v;
};

// Parse a decimal-looking value to a number (for internal calculations only).
const parseDecimal = (val: any): number | null => {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  return Number.isNaN(num) ? null : num;
};

// Normalize enum-ish values so mapping tables are resilient.
const normalizeEnumKey = (value: any): string | null => {
  if (value === null || value === undefined) return null;
  return String(value)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '_');
};

// Helper to look up an enum mapping with normalization.
const mapEnumNormalized = (
  value: any,
  mapping: Record<string, string>
): string | undefined => {
  const key = normalizeEnumKey(value);
  if (!key) return undefined;
  return mapping[key] ?? undefined;
};

// Generic SCREAMING_SNAKE → PascalCase (fallback when we don't have a table).
const screamingToPascal = (value: any): string | undefined => {
  const key = normalizeEnumKey(value);
  if (!key) return undefined;
  return key
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
};

// Generic PascalCase → SCREAMING_SNAKE (fallback when we don't have a table).
const pascalToScreaming = (value: any): string | undefined => {
  if (value === null || value === undefined) return undefined;
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase();
};

/* ------------------------------------------------------------------ */
/* Enum mapping tables (Loan ⇄ Pricing)                                */
/* ------------------------------------------------------------------ */

// AUS (ApiLoan.aus → LoanQuoteScenario.aus)
const LOAN_AUS_TO_PRICING_AUS: Record<string, string> = {
  NONE: 'None',
  MANUAL: 'Manual',
  DU: 'DU',
  LP: 'LP',
  OTHER: 'Other',
  NOT_SPECIFIED: 'NotSpecified'
};

// Impounds (ApiLoan.impoundType → LoanQuoteScenario.impounds)
const LOAN_IMPOUND_TYPE_TO_PRICING_IMPOUNDS: Record<string, string> = {
  NONE: 'None',
  PARTIAL: 'Partial',
  FULL: 'Full'
};

// Property occupancy (ApiLoan.property.occupancy → PropertyQuoteScenario.occupancy)
const LOAN_OCCUPANCY_TO_PRICING_OCCUPANCY: Record<string, string> = {
  PRIMARY: 'PrimaryResidence',
  SECONDARY: 'SecondHome',
  INVESTMENT: 'InvestmentProperty'
};

// PropertyType (ApiLoan.property.propertyType → PropertyQuoteScenario.propertyType)
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

// StreamlineRefinanceType (ApiLoan.streamlineRefinanceType → LoanQuoteScenario.streamlineRefinanceType)
const LOAN_STREAMLINE_TO_PRICING_STREAMLINE: Record<string, string> = {
  NONE: 'None',
  NO_CASHOUT_STREAMLINED_REFINANCE: 'NoCashoutStreamlinedRefinance',
  NO_CASHOUT_FHA_STREAMLINED_REFINANCE: 'NoCashoutFHAStreamlinedRefinance'
};

// TemporaryBuydownType (ApiLoan.temporaryBuydownType → LoanQuoteScenario.temporaryBuydownType)
const LOAN_BUYDOWN_TO_PRICING_BUYDOWN: Record<string, string> = {
  NONE: 'None',
  THREE_TWO_ONE: 'ThreeTwoOne',
  TWO_ONE: 'TwoOne',
  ONE_ONE: 'OneOne',
  ONE_ZERO: 'OneZero'
};

// Purpose (ApiLoan.purpose → QuoteScenarioRequest.purpose)
// This is not always a formal enum; it's a semantic mapping.
const LOAN_PURPOSE_TO_PRICING_PURPOSE: Record<string, string> = {
  PURCHASE: 'Purchase',
  NO_CASH_OUT_REFINANCE: 'NoCashOutRefinance',
  CASH_OUT_REFINANCE: 'CashOutRefinance',
  REFINANCE: 'Refinance',
  CONSTRUCTION: 'Construction',
  CONSTRUCTION_PERM: 'ConstructionPerm',
  OTHER: 'Other'
};

// Borrower.verificationMethod (ApiLoan.borrower.verificationMethod → BorrowerQuoteScenario.verificationMethod)
const LOAN_VERIFICATION_METHOD_TO_PRICING_VERIFICATION: Record<string, string> = {
  FULL: 'FullDocument',
  BANK_STATEMENT: 'BankStatement',
  VOE: 'VOE',
  ASSET_QUALIFICATION: 'AssetQualification',
  '1099': 'Method1099',
  DSCR: 'DSCR',
  CPAP_AND_L: 'CPAPAndL'
  // NONE / null ⇒ omitted
};

/* ------------------------------------------------------------------ */
/* SECTION 1: UI / PE3 → External QuoteScenarioRequest                 */
/* ------------------------------------------------------------------ */

// This path is mostly for your playground UI. It’s still "best-effort" but now
// keeps decimals as strings and avoids obviously wrong enum values.
export function uiToExternalPricingScenario(uiRequest: any) {
  const data = uiRequest?.data || uiRequest || {};

  return {
    audienceId: data.audienceId || 'Retail',

    // NOTE: Your UI uses a "search" object that's not formally in QuoteScenarioRequest.
    // We preserve it for playground behavior.
    search: {
      position: data.search?.position || 'First',
      desiredLockPeriod: data.search?.desiredLockPeriod || 30,
      includeInterestOnlyProducts: data.search?.includeInterestOnlyProducts || false,
      loanTypes: data.search?.loanTypes || [],
      amortizationTypes: data.search?.amortizationTypes || [],
      loanTerms: (data.search?.loanTerms || [])
        .map((term: any) => (term == null ? '' : String(term)))
        .filter((t: string) => t !== ''),
      armFixedTerms: (data.search?.armFixedTerms || [])
        .map((term: any) => (term == null ? '' : String(term)))
        .filter((t: string) => t !== '')
    },

    borrower: {
      firstName: data.borrower?.firstName || '',
      lastName: data.borrower?.lastName || '',
      fico: data.borrower?.fico ?? null,
      dtiRatio: toDecimalStringOrNull(data.borrower?.dtiRatio),
      monthsOfReserves: data.borrower?.monthsOfReserves ?? 0,
      isNonOccupancyBorrower: data.borrower?.isNonOccupancyBorrower ?? false,
      isNonOccupancyCoborrower: data.borrower?.isNonOccupancyCoborrower ?? false,
      propertiesOwned: data.borrower?.propertiesOwned ?? 0,
      isSelfEmployed: data.borrower?.isSelfEmployed ?? false,
      multipleBorrowerPairs: data.borrower?.multipleBorrowerPairs ?? false,
      verificationMethod: data.borrower?.verificationMethod || 'None',
      creditGrade: data.borrower?.creditGrade || 'None',
      isNonTraditionalCredit: data.borrower?.isNonTraditionalCredit ?? false,
      isGiftFunds: data.borrower?.isGiftFunds ?? false,
      residualIncome: data.borrower?.residualIncome ?? 0,
      isFirstTimeHomeBuyer: data.borrower?.isFirstTimeHomeBuyer ?? false,
      investorExperience:
        data.borrower?.investorExperience === 'NotApplicable'
          ? 0
          : data.borrower?.investorExperience ?? 0,
      fullDocMonths: data.borrower?.fullDocMonths ?? 0,
      cpaPandLMonths: data.borrower?.cpaPandLMonths ?? 0,
      annualIncome: data.borrower?.annualIncome ?? 0
    },

    loan: {
      purpose: data.loan?.purpose || 'Purchase',
      amount: toDecimalStringOrUndefined(data.loan?.amount),
      purchasePrice: toDecimalStringOrUndefined(data.loan?.purchasePrice),
      propertyValue: toDecimalStringOrUndefined(
        data.loan?.propertyValue ?? data.loan?.purchasePrice
      ),
      refinancePurpose: 0,
      cashOutAmount: toDecimalStringOrUndefined(data.loan?.cashOutAmount),
      secondAmount: toDecimalStringOrUndefined(data.loan?.secondAmount),
      helocLineAmount: toDecimalStringOrUndefined(data.loan?.helocLineAmount),
      helocDrawAmount: toDecimalStringOrUndefined(data.loan?.helocDrawAmount),
      paidByBorrower: data.loan?.isMortgageInsurancePaidByBorrower !== false,
      aus: data.loan?.aus || 'NotSpecified',
      position: data.loan?.position || 'First',
      prepaymentPenaltyPeriodMonths: data.loan?.prepaymentPenaltyPeriodMonths,

      // FHA
      fhaFinancingOption: data.loan?.fhaFinancingOption || 'Finance',
      fhaMortgageInsurancePremium: toDecimalStringOrUndefined(
        data.loan?.fhaMortgageInsurancePremium
      ),
      fhaMortgageInsurancePremiumAmount: toDecimalStringOrUndefined(
        data.loan?.fhaMortgageInsurancePremiumAmount
      ),
      fhaTotalLoanAmount: toDecimalStringOrUndefined(
        data.loan?.fhaTotalLoanAmount
      ),
      fhaFinanceAmount: toDecimalStringOrUndefined(data.loan?.fhaFinanceAmount),

      // USDA
      usdaFinancingOption: data.loan?.usdaFinancingOption || 'Finance',
      usdaGuaranteeFee: toDecimalStringOrUndefined(data.loan?.usdaGuaranteeFee),
      usdaGuaranteeFeeAmount: toDecimalStringOrUndefined(
        data.loan?.usdaGuaranteeFeeAmount
      ),
      usdaTotalLoanAmount: toDecimalStringOrUndefined(
        data.loan?.usdaTotalLoanAmount
      ),
      usdaFinanceAmount: toDecimalStringOrUndefined(data.loan?.usdaFinanceAmount),

      // VA
      vaFinancingOption: data.loan?.vaFinancingOption || 'Finance',
      vaDownPaymentAmount: toDecimalStringOrUndefined(
        data.loan?.vaDownPaymentAmount
      ),
      vaLoanHistory: data.loan?.vaLoanHistory || 'First',
      vaFundingFee: toDecimalStringOrUndefined(data.loan?.vaFundingFee),
      vaFundingFeeAmount: toDecimalStringOrUndefined(
        data.loan?.vaFundingFeeAmount
      ),
      vaTotalLoanAmount: toDecimalStringOrUndefined(
        data.loan?.vaTotalLoanAmount
      ),
      vaFinanceAmount: toDecimalStringOrUndefined(data.loan?.vaFinanceAmount),
      vaFundingFeeExempt: data.loan?.vaFundingFeeExempt ?? false,
      vaCashoutLTV: toDecimalStringOrUndefined(data.loan?.vaCashoutLTV),
      vaCashoutCLTV: toDecimalStringOrUndefined(data.loan?.vaCashoutCLTV),
      vaCashoutHCLTV: toDecimalStringOrUndefined(data.loan?.vaCashoutHCLTV),
      vaDownPayment: toDecimalStringOrUndefined(data.loan?.vaDownPayment),

      applicationDate: data.loan?.applicationDate,
      streamlineRefinanceType: data.loan?.streamlineRefinanceType,
      temporaryBuydownType: data.loan?.temporaryBuydownType,
      fhaPriorEndorsementDate: data.loan?.fhaPriorEndorsementDate,

      ltv: toDecimalStringOrUndefined(data.loan?.ltv),
      cltv: toDecimalStringOrUndefined(data.loan?.cltv),
      hcltv: toDecimalStringOrUndefined(data.loan?.hcltv),
      isMortgageInsurancePaidByBorrower:
        data.loan?.isMortgageInsurancePaidByBorrower !== false,
      impounds: data.loan?.impounds || 'Full'
    },

    property: {
      state: data.property?.state || '',
      county: data.property?.county || '',
      propertyType: data.property?.propertyType || 'SFR',
      occupancy: data.property?.occupancy || 'PrimaryResidence',
      units: data.property?.units ?? 1,
      stories: data.property?.stories ?? 1,
      isNonWarrantableProject: data.property?.isNonWarrantableProject ?? null,
      isCondotel: data.property?.isCondotel ?? null,
      inspectionWaiver: data.property?.inspectionWaiver ?? false,
      addressLine1: data.property?.addressLine1 || '',
      addressLine2: data.property?.addressLine2 || '',
      city: data.property?.city || '',
      countyFipsCode: data.property?.countyFipsCode || '',
      zipCode: data.property?.zipCode || '',
      propertyAttachmentType: data.property?.propertyAttachmentType || 'Unspecified',
      estimatedValue: toDecimalStringOrUndefined(data.property?.estimatedValue),
      appraisedValue: undefined
    },

    brokerCompPlan: {
      fixedAmount: toDecimalStringOrUndefined(data.brokerCompPlan?.fixedAmount),
      percent: toDecimalStringOrUndefined(data.brokerCompPlan?.percent),
      minAmount: toDecimalStringOrUndefined(data.brokerCompPlan?.minAmount),
      maxAmount: toDecimalStringOrUndefined(data.brokerCompPlan?.maxAmount),
      calculatedAmount: toDecimalStringOrUndefined(
        data.brokerCompPlan?.calculatedAmount
      ),
      paidBy: data.brokerCompPlan?.paidBy || 'Lender',
      calculatedAdjustment: toDecimalStringOrUndefined(
        data.brokerCompPlan?.calculatedAdjustment
      )
    },

    customValues: data.customValues || [],
    adjustments: data.adjustments || [],
    settings: {
      operations: data.settings?.operations || ['Eligibility', 'Pricing'],
      returnTerseResponse: data.settings?.returnTerseResponse !== false,
      returnTerseProductResponse: data.settings?.returnTerseProductResponse || false,
      returnIneligibleProducts: data.settings?.returnIneligibleProducts || false
    }
  };
}

/* ------------------------------------------------------------------ */
/* SECTION 2: Loan Service ApiLoan → External QuoteScenarioRequest     */
/* ------------------------------------------------------------------ */

const buildPricingBorrowerFromLoan = (loanData: any) => {
  const b = loanData?.borrower || {};
  const incomeMonthlyNum = parseDecimal(b.incomeMonthly);
  const annualIncome =
    incomeMonthlyNum !== null ? Math.round(incomeMonthlyNum * 12) : undefined;

  // Robust mapping for verificationMethod (FULL → FullDocument, etc.)
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
    verificationMethod, // <— now correctly "FullDocument", etc.
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
  const impounds = mapEnumNormalized(
    loanData.impoundType,
    LOAN_IMPOUND_TYPE_TO_PRICING_IMPOUNDS
  );
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

    // FHA
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

    // USDA
    usdaTotalLoanAmount: toDecimalStringOrUndefined(loanData.usdaTotalLoanAmount),
    usdaGuaranteeFeeAmount: toDecimalStringOrUndefined(loanData.usdaGuaranteeFeeAmount),
    usdaGuaranteeFee: toDecimalStringOrUndefined(loanData.usdaGuaranteedPercentage),
    usdaFinanceAmount: toDecimalStringOrUndefined(loanData.usdaFinancedAmount),
    usdaFinancingOption: screamingToPascal(loanData.usdaFinancingOption),

    // VA
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

    // MI / impounds
    isMortgageInsurancePaidByBorrower:
      loanData.isMortgageInsurancePaidByBorrower !== false,
    impounds: impounds || 'Full',

    // LTVs
    ltv: toDecimalStringOrUndefined(loanData.ltv),
    cltv: toDecimalStringOrUndefined(loanData.cltv),
    hcltv: toDecimalStringOrUndefined(loanData.hcltv),

    // Second / HELOC
    cashOutAmount: toDecimalStringOrUndefined(loanData.cashOutAmount),
    secondAmount: toDecimalStringOrUndefined(loanData.secondAmount),
    helocLineAmount: toDecimalStringOrUndefined(loanData.helocLineAmount),
    helocDrawAmount: toDecimalStringOrUndefined(loanData.helocDrawAmount),

    lenderFee: toDecimalStringOrUndefined(loanData.lenderFee),
    rollLenderFee: loanData.rollLenderFee ?? null,
    prepaymentPenaltyPeriodMonths: loanData.prepaymentPenaltyPeriodMonths ?? null,
    prepaymentPenaltyStructure: screamingToPascal(
      loanData.prepaymentPenaltyStructure
    ),
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

  const occupancy = mapEnumNormalized(
    p.occupancy,
    LOAN_OCCUPANCY_TO_PRICING_OCCUPANCY
  );
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

export function getLoanToExternalPricingScenario(loanData: any) {
  const audienceId = 'Retail';

  const purpose =
    mapEnumNormalized(loanData.purpose, LOAN_PURPOSE_TO_PRICING_PURPOSE) ||
    undefined;

  return {
    audienceId,
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

/* ------------------------------------------------------------------ */
/* SECTION 3: External QuoteScenarioRequest → Loan (ApiLoan)           */
/* ------------------------------------------------------------------ */

// This is still best-effort for your playground.
// It does *not* attempt to satisfy every required+nullable ApiLoan field.

export function externalToGetLoan(externalRequest: any) {
  const borrower = externalRequest.borrower || {};
  const loan = externalRequest.loan || {};
  const property = externalRequest.property || {};
  const search = externalRequest.search || {};

  return {
    borrower: {
      firstName: borrower.firstName || '',
      lastName: borrower.lastName || '',
      fico: borrower.fico ?? null,
      dtiRatio: toDecimalStringOrNull(borrower.dtiRatio),
      assetDepletionAmount: null,
      assetDocumentation: null,
      assetQualificationAmount: null,
      bankStatementExpenseMethod: null,
      businessBankStatementMonths: null,
      citizenship: borrower.citizenship || null,
      creditGrade: borrower.creditGrade || null,
      debtServiceCoverageRatio: null,
      employmentVerification: null,
      fullDocMonths: borrower.fullDocMonths ?? null,
      isNonOccupancyCoborrower: borrower.isNonOccupancyCoborrower ?? false,
      isGiftFunds: borrower.isGiftFunds ?? false,
      multipleBorrowerPairs: borrower.multipleBorrowerPairs ?? false,
      isNonTraditionalCredit: borrower.isNonTraditionalCredit ?? false,
      incomeMonthly: borrower.annualIncome
        ? toDecimalStringOrNull((borrower.annualIncome as number) / 12)
        : null,
      incomeDocumentation: null,
      isFirstTimeHomeBuyer: borrower.isFirstTimeHomeBuyer ?? false,
      isNonOccupancyBuyer: borrower.isNonOccupancyBorrower ?? false,
      isSelfEmployed: borrower.isSelfEmployed ?? false,
      months1099: null,
      cpaPandLMonths: borrower.cpaPandLMonths ?? null,
      bankStatementsNumberOfMonthsPersonal: null,
      propertiesOwned: borrower.propertiesOwned ?? 0,
      monthsOfReserves: borrower.monthsOfReserves ?? 0,
      verificationMethod: pascalToScreaming(borrower.verificationMethod) || null,
      verificationOfEmploymentAmount: null,
      derogatoryEvents: {
        deMultEvents: null,
        deMultBK: null,
        latePmt30x12: null,
        latePmt60x12: null,
        latePmt90x12: null,
        latePmt120x12: null,
        latePmt30x24: null,
        latePmt60x24: null,
        latePmt90x24: null,
        latePmt120x24: null,
        deMonthsDIL: null,
        deMonthsShortSale: null,
        deMonthsChargeOff: null,
        deMonthsBKC7: null,
        deMonthsBKC11: null,
        deMonthsBKC13: null,
        deMonthsLoanMod: null,
        deMonthsNoticeOfDefault: null,
        deMonthsForeclosure: null
      }
    },

    loanofficer: {
      name: '',
      email: '',
      assistantEmail: null
    },

    property: {
      addressLine1: property.addressLine1 || '',
      addressLine2: property.addressLine2 || '',
      appraisedValue: toDecimalStringOrNull(property.appraisedValue),
      city: property.city || '',
      county: property.county || '',
      countyFipsCode: property.countyFipsCode || '',
      countyFipsCodeOnly: null,
      isHighCostCounty: property.isHighCostCounty ?? null,
      estimatedValue: toDecimalStringOrNull(property.estimatedValue),
      inspectionWaiver: property.inspectionWaiver ?? null,
      isCondotel: property.isCondotel ?? null,
      isDecliningMarket: property.isDecliningMarket ?? null,
      isNonWarrantableProject: property.isNonWarrantableProject ?? null,
      lotSizeInAcres: toDecimalStringOrNull(property.lotSizeInAcres),
      occupancy: pascalToScreaming(property.occupancy) || 'PRIMARY',
      propertyType: pascalToScreaming(property.propertyType) || 'SFR',
      propertyAttachmentType: pascalToScreaming(property.propertyAttachmentType),
      state: property.state || '',
      stateFipsCode: '',
      stories: property.stories ?? 1,
      units: property.units ?? 1,
      zipCode: property.zipCode || '',
      zipCodePlusFour: property.zipCodePlusFour || null,
      msaCode: null,
      censusTract: null,
      medianIncome: toDecimalStringOrNull(property.medianIncome)
    },

    customValues: externalRequest.customValues || null,
    externalCreatedAt: new Date().toISOString(),
    externalModifiedAt: new Date().toISOString(),
    loanNumber: '',
    purpose: pascalToScreaming(externalRequest.purpose) || 'PURCHASE',
    amount: toDecimalStringOrNull(loan.amount) || '0.0000',
    rate: null,
    productName: '',
    productCode: '',
    aus: pascalToScreaming(loan.aus) || 'NOT_SPECIFIED',
    applicationDate: loan.applicationDate || null,
    fundedAt: null,
    ltv: toDecimalStringOrNull(loan.ltv) || '0.0000',
    cltv: toDecimalStringOrNull(loan.cltv) || '0.0000',
    hcltv: toDecimalStringOrNull(loan.hcltv) || '0.0000',
    amortizationType: null,
    documentationType: null,
    cashOutAmount: toDecimalStringOrNull(loan.cashOutAmount) || '0.0000',
    fhaCaseAssignmentDate: loan.fhaPriorEndorsementDate || null,
    fhaTotalLoanAmount: toDecimalStringOrNull(loan.fhaTotalLoanAmount),
    helocDrawAmount: toDecimalStringOrNull(loan.helocDrawAmount),
    helocLineAmount: toDecimalStringOrNull(loan.helocLineAmount) || '0.0000',
    isRelocationLoan: null,
    lenderFee: toDecimalStringOrNull(loan.lenderFee),
    isMortgageInsurancePaidByBorrower:
      loan.isMortgageInsurancePaidByBorrower !== false,
    prepaymentPenaltyPeriodMonths: loan.prepaymentPenaltyPeriodMonths || null,
    prepaymentPenaltyStructure: pascalToScreaming(
      loan.prepaymentPenaltyStructure
    ) || null,
    prepaymentPenaltyStructureType: pascalToScreaming(
      loan.prepaymentPenaltyStructureType
    ) || null,
    propertyValue: toDecimalStringOrNull(loan.propertyValue) || '0.0000',
    purchasePrice: toDecimalStringOrNull(loan.purchasePrice) || '0.0000',
    refinancePurpose: 'NONE',
    secondAmount: toDecimalStringOrNull(loan.secondAmount),
    position: pascalToScreaming(loan.position) || 'FIRST',
    isSecondInvestorSameAsFirst: loan.isSecondInvestorSameAsFirst ?? null,
    isSecondCommunityLoan: loan.isSecondCommunityLoan ?? null,
    isSecondPiggyback: loan.isSecondPiggyback ?? null,
    servicerName: '',
    temporaryBuydownType: pascalToScreaming(
      loan.temporaryBuydownType
    ) || null,
    loanTerm: loan.loanTerm ?? null,
    loanType: pascalToScreaming(loan.loanType),
    usdaTotalLoanAmount: toDecimalStringOrNull(loan.usdaTotalLoanAmount),
    vaTotalLoanAmount: toDecimalStringOrNull(loan.vaTotalLoanAmount),
    impoundType: pascalToScreaming(loan.impounds) || 'FULL',
    rollLenderFee: loan.rollLenderFee ?? null,
    streamlineRefinanceType: pascalToScreaming(
      loan.streamlineRefinanceType
    ) || null,
    armFixedTerm: loan.armFixedTerm ?? null,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    losLoanId: ''
  };
}

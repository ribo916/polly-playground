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
/* SECTION 1: UI / PE3 → External PricingScenarioRequest              */
/* ------------------------------------------------------------------ */

export function uiToExternalPricingScenario(uiRequest: any) {
  // Normalize incoming root
  const data = uiRequest?.data ?? uiRequest ?? {};

  /* --------------------------------------------------------------------------- */
  /* ENUM TABLES – MUST BE DECLARED BEFORE USE                                   */
  /* --------------------------------------------------------------------------- */
  const ENUMS = {
    LoanPurpose: {
      "1": "Purchase",
      "2": "Refinance",
      "3": "Construction",
      "4": "ConstructionPerm",
      "5": "Other",
      "6": "NoCashOutRefinance",
      "7": "CashOutRefinance"
    },
    RefinancePurpose: {
      "0": "None",
      "1": "NoCashOut",
      "2": "CashOut",
      "3": "LimitedCashOut",
      "4": "HomeImprovement",
      "5": "DebtConsolidation",
      "6": "Other"
    },
    Occupancy: {
      "0": "None",
      "1": "PrimaryResidence",
      "2": "SecondHome",
      "3": "InvestmentProperty"
    },
    PropertyType: {
      "1": "SFR",
      "2": "Condominium",
      "3": "PUD",
      "5": "Mobile",
      "6": "TwoForUnit",
      "7": "Cooperative",
      "8": "Townhome",
      "9": "Multifamily",
      "10": "Commercial",
      "11": "MixedUse",
      "12": "Farm",
      "13": "HomeAndBusiness",
      "14": "Land",
      "15": "ManufacturedSingleWide",
      "16": "ManufacturedDoubleWide"
    },
    Impounds: {
      "0": "None",
      "1": "Partial",
      "2": "Full"
    },
    AUS: {
      "0": "None",
      "1": "Manual",
      "2": "DU",
      "3": "LP",
      "4": "Other",
      "5": "NotSpecified"
    },
    TemporaryBuydown: {
      "0": "None",
      "1": "ThreeTwoOne",
      "2": "TwoOne",
      "3": "OneOne",
      "4": "OneZero"
    },
    VerificationMethod: {
      "1": "FullDocument",
      "2": "BankStatement",
      "3": "VOE",
      "4": "AssetQualification",
      "5": "DSCR",
      "6": "Method1099",
      "7": "CPAPAndL"
    },
    CreditGrade: {
      "1": "A",
      "2": "B",
      "3": "C",
      "4": "D",
      "5": "APlus",
      "6": "BMinus",
      "7": "AAA",
      "8": "AA",
      "9": "AMinus",
      "10": "BB",
      "11": "BPlus",
      "12": "CMinus",
      "13": "BBB",
      "14": "CCC",
      "15": "CC",
      "16": "CPlus",
      "17": "DDD",
      "18": "DD",
      "19": "DPlus",
      "20": "DMinus"
    }
  };

  /* --------------------------------------------------------------------------- */
  /* SAFE ENUM MAPPER – NO MORE CRASHES                                          */
  /* --------------------------------------------------------------------------- */
  const mapEnum = (
    value: any,
    table: Record<string, string> | undefined,
    fallback: string
  ) => {
    if (!table) {
      console.warn("[uiToExternalPricingScenario] Missing enum table → fallback:", fallback);
      return fallback;
    }
    if (value === null || value === undefined || value === "") return fallback;

    const key = String(value).trim();
    if (table[key]) return table[key];

    console.warn("[uiToExternalPricingScenario] Unknown enum:", value, "→ fallback:", fallback);
    return fallback;
  };

  /* --------------------------------------------------------------------------- */
  /* NORMALIZE ALL INPUT SHAPES (PascalCase *or* camelCase)                      */
  /* --------------------------------------------------------------------------- */
  const search = data.search ?? data.Search ?? {};
  const borrowerSrc = data.borrower ?? data.Borrower ?? {};
  const loanSrc = data.loan ?? data.Loan ?? {};
  const propertySrc = data.property ?? data.Property ?? {};
  const brokerCompSrc = data.brokerCompPlan ?? data.BrokerCompPlan ?? {};
  const customValuesSrc = data.customValues ?? data.CustomValues ?? [];

  /* --------------------------------------------------------------------------- */
  /* BUILD OUTPUT — FULLY EXTERNAL PRICING-SCENARIO FORMAT                       */
  /* --------------------------------------------------------------------------- */

  return {
    audienceId: data.audienceId ?? data.AudienceId ?? "Retail",

    search: {
      position: search.position ?? search.Position ?? "First",
      desiredLockPeriod: search.desiredLockPeriod ?? search.DesiredLockPeriod ?? 30,
      includeInterestOnlyProducts:
        search.includeInterestOnlyProducts ??
        search.IncludeInterestOnlyProducts ??
        false,
      loanTypes: search.loanTypes ?? search.LoanTypes ?? [],
      amortizationTypes: search.amortizationTypes ?? search.AmortizationTypes ?? [],
      loanTerms: (search.loanTerms ?? search.LoanTerms ?? []).map(String),
      armFixedTerms: (search.armFixedTerms ?? search.ArmFixedTerms ?? []).map(String)
    },

    borrower: {
      firstName: borrowerSrc.firstName ?? borrowerSrc.FirstName ?? "",
      lastName: borrowerSrc.lastName ?? borrowerSrc.LastName ?? "",
      fico: borrowerSrc.fico ?? borrowerSrc.FICO ?? null,
      dtiRatio: toDecimalStringOrNull(
        borrowerSrc.dtiRatio ?? borrowerSrc.DTIRatio
      ),
      monthsOfReserves:
        borrowerSrc.monthsOfReserves ?? borrowerSrc.MonthsOfReserves ?? 0,
      isNonOccupancyBorrower:
        borrowerSrc.isNonOccupancyBorrower ?? borrowerSrc.IsNonOccupancyBorrower ?? false,
      isNonOccupancyCoborrower:
        borrowerSrc.isNonOccupancyCoborrower ?? borrowerSrc.IsNonOccupancyCoborrower ?? false,
      propertiesOwned:
        borrowerSrc.propertiesOwned ?? borrowerSrc.PropertiesOwned ?? 0,
      isSelfEmployed:
        borrowerSrc.isSelfEmployed ?? borrowerSrc.IsSelfEmployed ?? false,
      multipleBorrowerPairs:
        borrowerSrc.multipleBorrowerPairs ?? borrowerSrc.MultipleBorrowerPairs ?? false,
      verificationMethod: mapEnum(
        borrowerSrc.verificationMethod ?? borrowerSrc.VerificationMethod,
        ENUMS.VerificationMethod,
        "None"
      ),
      creditGrade: mapEnum(
        borrowerSrc.creditGrade ?? borrowerSrc.CreditGrade,
        ENUMS.CreditGrade,
        "None"
      ),
      isNonTraditionalCredit:
        borrowerSrc.isNonTraditionalCredit ??
        borrowerSrc.IsNonTraditionalCredit ??
        false,
      isGiftFunds: borrowerSrc.isGiftFunds ?? borrowerSrc.IsGiftFunds ?? false,
      residualIncome:
        borrowerSrc.residualIncome ?? borrowerSrc.ResidualIncome ?? 0,
      isFirstTimeHomeBuyer:
        borrowerSrc.isFirstTimeHomeBuyer ??
        borrowerSrc.IsFirstTimeHomeBuyer ??
        false,
      investorExperience:
        borrowerSrc.investorExperience ?? borrowerSrc.InvestorExperience ?? 0,
      fullDocMonths:
        borrowerSrc.fullDocMonths ?? borrowerSrc.FullDocMonths ?? 0,
      cpaPandLMonths:
        borrowerSrc.cpaPandLMonths ?? borrowerSrc.CpaPandLMonths ?? 0,
      annualIncome: borrowerSrc.annualIncome ?? borrowerSrc.AnnualIncome ?? 0
    },

    loan: {
      purpose: mapEnum(
        loanSrc.purpose ?? loanSrc.Purpose,
        ENUMS.LoanPurpose,
        "Purchase"
      ),

      amount: toDecimalStringOrUndefined(loanSrc.amount ?? loanSrc.Amount),
      purchasePrice: toDecimalStringOrUndefined(
        loanSrc.purchasePrice ?? loanSrc.PurchasePrice
      ),
      propertyValue: toDecimalStringOrUndefined(
        (loanSrc.propertyValue ?? loanSrc.PropertyValue) ??
          (loanSrc.purchasePrice ?? loanSrc.PurchasePrice)
      ),

      refinancePurpose: mapEnum(
        loanSrc.refinancePurpose ?? loanSrc.RefinancePurpose,
        ENUMS.RefinancePurpose,
        "None"
      ),

      cashOutAmount: toDecimalStringOrUndefined(
        loanSrc.cashOutAmount ?? loanSrc.CashOutAmount
      ),
      secondAmount: toDecimalStringOrUndefined(
        loanSrc.secondAmount ?? loanSrc.SecondAmount
      ),
      helocLineAmount: toDecimalStringOrUndefined(
        loanSrc.helocLineAmount ?? loanSrc.HelocLineAmount
      ),
      helocDrawAmount: toDecimalStringOrUndefined(
        loanSrc.helocDrawAmount ?? loanSrc.HelocDrawAmount
      ),

      paidByBorrower:
        (loanSrc.isMortgageInsurancePaidByBorrower ??
          loanSrc.IsMortgageInsurancePaidByBorrower) !== false,

      aus: mapEnum(
        loanSrc.aus ?? loanSrc.Aus,
        ENUMS.AUS,
        "NotSpecified"
      ),

      position: loanSrc.position ?? loanSrc.Position ?? "First",

      fhaFinancingOption:
        loanSrc.fhaFinancingOption ?? loanSrc.FhaFinancingOption ?? "Finance",
      fhaMortgageInsurancePremium: toDecimalStringOrUndefined(
        loanSrc.fhaMortgageInsurancePremium ??
          loanSrc.FhaMortgageInsurancePremium
      ),
      fhaMortgageInsurancePremiumAmount: toDecimalStringOrUndefined(
        loanSrc.fhaMortgageInsurancePremiumAmount ??
          loanSrc.FhaMortgageInsurancePremiumAmount
      ),
      fhaTotalLoanAmount: toDecimalStringOrUndefined(
        loanSrc.fhaTotalLoanAmount ?? loanSrc.FhaTotalLoanAmount
      ),
      fhaFinanceAmount: toDecimalStringOrUndefined(
        loanSrc.fhaFinanceAmount ?? loanSrc.FhaFinanceAmount
      ),

      usdaFinancingOption:
        loanSrc.usdaFinancingOption ?? loanSrc.UsdaFinancingOption ?? "Finance",
      usdaGuaranteeFee: toDecimalStringOrUndefined(
        loanSrc.usdaGuaranteeFee ?? loanSrc.UsdaGuaranteeFee
      ),
      usdaGuaranteeFeeAmount: toDecimalStringOrUndefined(
        loanSrc.usdaGuaranteeFeeAmount ?? loanSrc.UsdaGuaranteeFeeAmount
      ),
      usdaTotalLoanAmount: toDecimalStringOrUndefined(
        loanSrc.usdaTotalLoanAmount ?? loanSrc.UsdaTotalLoanAmount
      ),
      usdaFinanceAmount: toDecimalStringOrUndefined(
        loanSrc.usdaFinanceAmount ?? loanSrc.UsdaFinanceAmount
      ),

      vaFinancingOption:
        loanSrc.vaFinancingOption ?? loanSrc.VaFinancingOption ?? "Finance",
      vaDownPaymentAmount: toDecimalStringOrUndefined(
        loanSrc.vaDownPaymentAmount ?? loanSrc.VaDownPaymentAmount
      ),
      vaLoanHistory: loanSrc.vaLoanHistory ?? loanSrc.VaLoanHistory ?? "First",
      vaFundingFee: toDecimalStringOrUndefined(
        loanSrc.vaFundingFee ?? loanSrc.VaFundingFee
      ),
      vaFundingFeeAmount: toDecimalStringOrUndefined(
        loanSrc.vaFundingFeeAmount ?? loanSrc.VaFundingFeeAmount
      ),
      vaTotalLoanAmount: toDecimalStringOrUndefined(
        loanSrc.vaTotalLoanAmount ?? loanSrc.VaTotalLoanAmount
      ),
      vaFinanceAmount: toDecimalStringOrUndefined(
        loanSrc.vaFinanceAmount ?? loanSrc.VaFinanceAmount
      ),
      vaFundingFeeExempt:
        loanSrc.vaFundingFeeExempt ?? loanSrc.VaFundingFeeExempt ?? false,

      vaCashoutLTV: toDecimalStringOrUndefined(
        loanSrc.vaCashoutLTV ?? loanSrc.VaCashoutLTV
      ),
      vaCashoutCLTV: toDecimalStringOrUndefined(
        loanSrc.vaCashoutCLTV ?? loanSrc.VaCashoutCLTV
      ),
      vaCashoutHCLTV: toDecimalStringOrUndefined(
        loanSrc.vaCashoutHCLTV ?? loanSrc.VaCashoutHCLTV
      ),
      vaDownPayment: toDecimalStringOrUndefined(
        loanSrc.vaDownPayment ?? loanSrc.VaDownPayment
      ),

      applicationDate: loanSrc.applicationDate ?? loanSrc.ApplicationDate ?? null,

      streamlineRefinanceType: mapEnum(
        loanSrc.streamlineRefinanceType ?? loanSrc.StreamlineRefinanceType,
        {
          "0": "None",
          "1": "NoCashoutStreamlinedRefinance",
          "2": "NoCashOutFHAStreamlinedRefinance"
        },
        "None"
      ),

      temporaryBuydownType: mapEnum(
        loanSrc.temporaryBuydownType ?? loanSrc.TemporaryBuydownType,
        ENUMS.TemporaryBuydown,
        "None"
      ),

      ltv: toDecimalStringOrUndefined(loanSrc.ltv ?? loanSrc.LTV),
      cltv: toDecimalStringOrUndefined(loanSrc.cltv ?? loanSrc.CLTV),
      hcltv: toDecimalStringOrUndefined(loanSrc.hcltv ?? loanSrc.HCLTV),
      impounds: mapEnum(loanSrc.impounds ?? loanSrc.Impounds, ENUMS.Impounds, "Full")
    },

    property: {
      state: propertySrc.state ?? propertySrc.State ?? "",
      county: propertySrc.county ?? propertySrc.County ?? "",
      propertyType: mapEnum(
        propertySrc.propertyType ?? propertySrc.PropertyType,
        ENUMS.PropertyType,
        "SFR"
      ),
      occupancy: mapEnum(
        propertySrc.occupancy ?? propertySrc.Occupancy,
        ENUMS.Occupancy,
        "PrimaryResidence"
      ),
      units: propertySrc.units ?? propertySrc.Units ?? 1,
      stories: propertySrc.stories ?? propertySrc.Stories ?? 1,
      isNonWarrantableProject:
        propertySrc.isNonWarrantableProject ??
        propertySrc.IsNonWarrantableProject ??
        null,
      isCondotel:
        propertySrc.isCondotel ?? propertySrc.IsCondotel ?? null,
      inspectionWaiver:
        propertySrc.inspectionWaiver ?? propertySrc.InspectionWaiver ?? false,
      addressLine1: propertySrc.addressLine1 ?? propertySrc.AddressLine1 ?? "",
      addressLine2: propertySrc.addressLine2 ?? propertySrc.AddressLine2 ?? "",
      city: propertySrc.city ?? propertySrc.City ?? "",
      countyFipsCode:
        propertySrc.countyFipsCode ?? propertySrc.CountyFipsCode ?? "",
      zipCode: propertySrc.zipCode ?? propertySrc.ZipCode ?? "",
      propertyAttachmentType: mapEnum(
        propertySrc.propertyAttachmentType ??
          propertySrc.PropertyAttachmentType,
        {
          "0": "Unspecified",
          "1": "Detached",
          "2": "Attached"
        },
        "Unspecified"
      ),
      estimatedValue: toDecimalStringOrUndefined(
        propertySrc.estimatedValue ?? propertySrc.EstimatedValue
      ),
      appraisedValue: undefined
    },

    brokerCompPlan: {
      fixedAmount: toDecimalStringOrUndefined(
        brokerCompSrc.fixedAmount ?? brokerCompSrc.FixedAmount
      ),
      percent: toDecimalStringOrUndefined(
        brokerCompSrc.percent ?? brokerCompSrc.Percent
      ),
      minAmount: toDecimalStringOrUndefined(
        brokerCompSrc.minAmount ?? brokerCompSrc.MinAmount
      ),
      maxAmount: toDecimalStringOrUndefined(
        brokerCompSrc.maxAmount ?? brokerCompSrc.MaxAmount
      ),
      calculatedAmount: toDecimalStringOrUndefined(
        brokerCompSrc.calculatedAmount ?? brokerCompSrc.CalculatedAmount
      ),
      paidBy: brokerCompSrc.paidBy ?? brokerCompSrc.PaidBy ?? "Lender",
      calculatedAdjustment: toDecimalStringOrUndefined(
        brokerCompSrc.calculatedAdjustment ??
          brokerCompSrc.CalculatedAdjustment
      )
    },

    customValues: customValuesSrc,
    adjustments: data.adjustments ?? data.Adjustments ?? [],

    settings: {
      operations:
        data.settings?.operations ??
        data.Settings?.Operations ??
        ["Eligibility", "Pricing"],
      returnTerseResponse:
        data.settings?.returnTerseResponse ??
        data.Settings?.ReturnTerseResponse ??
        true,
      returnTerseProductResponse:
        data.settings?.returnTerseProductResponse ??
        data.Settings?.ReturnTerseProductResponse ??
        false,
      returnIneligibleProducts:
        data.settings?.returnIneligibleProducts ??
        data.Settings?.ReturnIneligibleProducts ??
        false
    }
  };
}


/* ------------------------------------------------------------------ */
/* SECTION 2: Loan Service ApiLoan → External Pricing ScenarioRequest */
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
/* SECTION 3: External PricingScenarioRequest → Loan (ApiLoan)        */
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

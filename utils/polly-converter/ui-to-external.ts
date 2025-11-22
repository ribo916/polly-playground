/* eslint-disable @typescript-eslint/no-explicit-any */

// ui-to-external.ts
//------------------------------------------------------------
// UI → External Pricing Scenario Converter (final, accurate)
//------------------------------------------------------------

/**
 * Converts any number/string to string decimal with up to 4 places.
 */
const toDecimal = (val: any): string | undefined => {
  if (val === null || val === undefined || val === '') return undefined;
  const num =
    typeof val === 'number'
      ? val
      : typeof val === 'string'
      ? parseFloat(val)
      : NaN;
  if (Number.isNaN(num)) return undefined;
  return num.toFixed(4).replace(/\.?0+$/, '');
};

/**
 * Simple enum mapper: UI integer/string → Pricing string value.
 */
const mapEnum = (
  value: any,
  table: Record<string | number, string>
): string | undefined => {
  if (value === null || value === undefined) return undefined;
  return table[String(value)];
};

//------------------------------------------------------------
// ENUM TABLES — EXACTLY FROM YOUR GUIDE
//------------------------------------------------------------

const UI_ENUMS = {
  LoanPurpose: {
    1: 'Purchase',
    2: 'Refinance',
    3: 'Construction',
    4: 'ConstructionPerm',
    5: 'Other',
    6: 'NoCashOutRefinance',
    7: 'CashOutRefinance'
  },
  LoanRefinancePurpose: {
    0: 'None',
    1: 'NoCashOut',
    2: 'CashOut',
    3: 'LimitedCashOut',
    4: 'HomeImprovement',
    5: 'DebtConsolidation',
    6: 'Other'
  },
  Occupancy: {
    0: 'None',
    1: 'PrimaryResidence',
    2: 'SecondHome',
    3: 'InvestmentProperty'
  },
  PropertyType: {
    1: 'SFR',
    2: 'Condominium',
    3: 'PUD',
    5: 'Mobile',
    6: 'TwoForUnit',
    7: 'Cooperative',
    8: 'Townhome',
    9: 'Multifamily',
    10: 'Commercial',
    11: 'MixedUse',
    12: 'Farm',
    13: 'HomeAndBusiness',
    14: 'Land',
    15: 'ManufacturedSingleWide',
    16: 'ManufacturedDoubleWide'
  },
  Impounds: {
    0: 'None',
    1: 'Partial',
    2: 'Full'
  },
  LoanType: {
    1: 'Conventional',
    2: 'FHA',
    3: 'VA',
    4: 'USDA',
    5: 'Jumbo',
    8: 'NonQM',
    9: 'HELOC'
  },
  LoanPosition: {
    0: 'First',
    1: 'Second',
    2: 'HELOC',
    3: 'Third'
  },
  EmploymentDocumentationMethod: {
    0: 'None',
    1: 'Stated',
    2: 'Verified'
  },
  VerificationMethod: {
    1: 'FullDocument',
    2: 'BankStatement',
    3: 'VOE',
    4: 'AssetQualification',
    5: 'DSCR',
    6: 'Method1099',
    7: 'CPAPAndL'
  },
  Citizenship: {
    0: 'None',
    1: 'ForeignNational',
    2: 'NonPermanentResidentAlien',
    3: 'PermanentResidentAlien',
    4: 'USCitizen',
    5: 'USCitizenAbroad'
  },
  TemporaryBuydown: {
    0: 'None',
    1: 'ThreeTwoOne',
    2: 'TwoOne',
    3: 'OneOne',
    4: 'OneZero'
  },
  PropertyAttachment: {
    0: 'Unspecified',
    1: 'Detached',
    2: 'Attached'
  },
  AUS: {
    0: 'None',
    1: 'Manual',
    2: 'DU',
    3: 'LP',
    4: 'Other',
    5: 'NotSpecified'
  },
  StreamlineRefinanceType: {
    0: 'None',
    1: 'NoCashoutStreamlinedRefinance',
    2: 'NoCashOutFHAStreamlinedRefinance'
  },
  PrepayPenaltyStructureType: {
    0: 'None',
    1: 'NoPrepay',
    2: 'Fixed',
    3: 'Declining',
    4: 'SixMonthsInterest'
  },
  CreditGrade: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'APlus',
    6: 'BMinus',
    7: 'AAA',
    8: 'AA',
    9: 'AMinus',
    10: 'BB',
    11: 'BPlus',
    12: 'CMinus',
    13: 'BBB',
    14: 'CCC',
    15: 'CC',
    16: 'CPlus',
    17: 'DDD',
    18: 'DD',
    19: 'DPlus',
    20: 'DMinus'
  }
};

// BrokerCompPlan.paidBy
const UI_BROKER_PAID_BY: Record<string, string> = {
  1: 'Lender',
  2: 'Borrower',
  3: 'Split'
};

//------------------------------------------------------------
// MAIN FUNCTION
//------------------------------------------------------------
export function uiToExternalPricingScenario(ui: any) {
  return {
    audienceId: ui.AudienceId ?? ui.audienceId,

    search: {
      position: mapEnum(ui.Search?.Position, UI_ENUMS.LoanPosition),
      desiredLockPeriod: ui.Search?.desiredLockPeriod,
      includeInterestOnlyProducts: ui.Search?.includeInterestOnlyProducts ?? false,
      loanTypes: ui.Search?.loanTypes ?? [],
      amortizationTypes: ui.Search?.amortizationTypes ?? [],
      loanTerms: ui.Search?.loanTerms ?? [],
      armFixedTerms: ui.Search?.armFixedTerms ?? []
    },

    borrower: {
      firstName: ui.Borrower?.firstName ?? '',
      lastName: ui.Borrower?.lastName ?? '',
      fico: ui.Borrower?.fico ? Number(ui.Borrower.fico) : undefined,
      dtiRatio: toDecimal(ui.Borrower?.dtiRatio),
      monthsOfReserves: Number(ui.Borrower?.monthsOfReserves ?? 0),
      isNonOccupancyBorrower: ui.Borrower?.isNonOccupancyBorrower ?? false,
      isNonOccupancyCoborrower: ui.Borrower?.isNonOccupancyCoborrower ?? false,
      propertiesOwned: Number(ui.Borrower?.propertiesOwned ?? 0),
      isSelfEmployed: ui.Borrower?.isSelfEmployed ?? false,
      multipleBorrowerPairs: ui.Borrower?.multipleBorrowerPairs ?? false,

      verificationMethod: mapEnum(ui.Borrower?.verificationMethod, UI_ENUMS.VerificationMethod),
      creditGrade: mapEnum(ui.Borrower?.creditGrade, UI_ENUMS.CreditGrade),

      /** ADDED — REQUIRED FOR FHA/VA/NQM accuracy */
      citizenship: mapEnum(ui.Borrower?.citizenship, UI_ENUMS.Citizenship),

      /** ADDED — required for DSCR / NonQM doc logic */
      employmentDocumentationMethod: mapEnum(
        ui.Borrower?.employmentDocumentationMethod,
        UI_ENUMS.EmploymentDocumentationMethod
      ),

      isNonTraditionalCredit: ui.Borrower?.isNonTraditionalCredit ?? false,
      isGiftFunds: ui.Borrower?.isGiftFunds ?? false,
      isFirstTimeHomeBuyer: ui.Borrower?.isFirstTimeHomeBuyer ?? false,
      fullDocMonths: Number(ui.Borrower?.fullDocMonths ?? 0),
      cpaPandLMonths: Number(ui.Borrower?.cpaPandLMonths ?? 0),
      annualIncome: Number(ui.Borrower?.income ?? 0)
    },

    loan: {
      purpose: mapEnum(ui.Loan?.purpose, UI_ENUMS.LoanPurpose),
      amount: toDecimal(ui.Loan?.amount),
      purchasePrice: toDecimal(ui.Loan?.purchasePrice),
      propertyValue: toDecimal(ui.Loan?.propertyValue),

      refinancePurpose: mapEnum(
        ui.Loan?.refinancePurpose,
        UI_ENUMS.LoanRefinancePurpose
      ),

      cashOutAmount: toDecimal(ui.Loan?.cashOutAmount),
      secondAmount: toDecimal(ui.Loan?.secondAmount),
      helocLineAmount: toDecimal(ui.Loan?.helocLineAmount),
      helocDrawAmount: toDecimal(ui.Loan?.helocDrawAmount),

      isMortgageInsurancePaidByBorrower:
        ui.Loan?.isMortgageInsurancePaidByBorrower ?? false,

      impounds: mapEnum(ui.Loan?.impounds, UI_ENUMS.Impounds),
      aus: mapEnum(ui.Loan?.aus, UI_ENUMS.AUS),
      position: mapEnum(ui.Loan?.position, UI_ENUMS.LoanPosition),

      /** ADDED — FHA/VA/NQM rules rely on these */
      temporaryBuydownType: mapEnum(
        ui.Loan?.temporaryBuydownType,
        UI_ENUMS.TemporaryBuydown
      ),

      streamlineRefinanceType: mapEnum(
        ui.Loan?.streamlineRefinanceType,
        UI_ENUMS.StreamlineRefinanceType
      ),

      prepaymentPenaltyStructureType: mapEnum(
        ui.Loan?.prepaymentPenaltyStructureType,
        UI_ENUMS.PrepayPenaltyStructureType
      ),

      loanType: mapEnum(ui.Loan?.loanType, UI_ENUMS.LoanType),

      ltv: toDecimal(ui.Loan?.ltv),
      cltv: toDecimal(ui.Loan?.cltv),
      hcltv: toDecimal(ui.Loan?.hcltv)
    },

    property: {
      state: ui.Property?.state,
      county: ui.Property?.county,
      propertyType: mapEnum(ui.Property?.propertyType, UI_ENUMS.PropertyType),
      occupancy: mapEnum(ui.Property?.occupancy, UI_ENUMS.Occupancy),
      units: Number(ui.Property?.units ?? 1),
      stories: Number(ui.Property?.stories ?? 1),
      addressLine1: ui.Property?.addressLine1,
      addressLine2: ui.Property?.addressLine2 ?? '',
      city: ui.Property?.city,
      countyFipsCode: ui.Property?.countyFipsCode,
      zipCode: ui.Property?.zipCode,

      /** ADDED — drives condo/attached pricing */
      propertyAttachmentType: mapEnum(
        ui.Property?.propertyAttachmentType,
        UI_ENUMS.PropertyAttachment
      )
    },

    brokerCompPlan: {
      fixedAmount: toDecimal(ui.BrokerCompPlan?.fixedAmount),
      percent: toDecimal(ui.BrokerCompPlan?.percent),
      minAmount: toDecimal(ui.BrokerCompPlan?.minAmount),
      maxAmount: toDecimal(ui.BrokerCompPlan?.maxAmount),
      calculatedAmount: toDecimal(ui.BrokerCompPlan?.calculatedAmount),
      calculatedAdjustment: toDecimal(ui.BrokerCompPlan?.calculatedAdjustment),
      paidBy: mapEnum(ui.BrokerCompPlan?.paidBy, UI_BROKER_PAID_BY)
    },

    customValues: Array.isArray(ui.CustomValues)
      ? ui.CustomValues.map((cv: any) => ({
          name: cv.name,
          value: cv.value ?? null
        }))
      : []
  };
}

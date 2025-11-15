// Polly API JSON Converter
// Handles conversions between internal UI/PE3 format and external API format

/**
 * Helper Functions
 */

// Convert string to number (handles "0.0000" format)
const toNumber = (val: any): number | null => {
  if (val === null || val === undefined || val === '') return null;
  const num = parseFloat(val);
  return isNaN(num) ? null : num;
};

// Convert number to string with 4 decimal places
const toString = (val: any, decimals: number = 4): string | null => {
  if (val === null || val === undefined) return null;
  return typeof val === 'number' ? val.toFixed(decimals) : String(val);
};

// Convert case: PascalCase/camelCase to SCREAMING_SNAKE_CASE
const toScreamingSnakeCase = (str: string | null | undefined): string => {
  if (!str) return str || '';
  return str
    .replace(/([A-Z])/g, '_$1')
    .toUpperCase()
    .replace(/^_/, '');
};

// Convert case: SCREAMING_SNAKE_CASE to PascalCase
const toPascalCase = (str: string | null | undefined): string => {
  if (!str) return str || '';
  return str
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

// Convert case: SCREAMING_SNAKE_CASE to camelCase
const toCamelCase = (str: string | null | undefined): string => {
  if (!str) return str || '';
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/**
 * CONVERSION 1: UI/PE3 Request → External API /pricing-scenario Request
 */
export function uiToExternalPricingScenario(uiRequest: any) {
  const data = uiRequest.data || uiRequest;
  
  return {
    audienceId: data.audienceId || "Retail",
    search: {
      position: data.search?.position || "First",
      desiredLockPeriod: data.search?.desiredLockPeriod || 30,
      includeInterestOnlyProducts: data.search?.includeInterestOnlyProducts || false,
      loanTypes: data.search?.loanTypes || [],
      amortizationTypes: data.search?.amortizationTypes || [],
      loanTerms: (data.search?.loanTerms || []).map((term: any) => toString(term, 0) || "").filter((t: string) => t !== ""),
      armFixedTerms: (data.search?.armFixedTerms || []).map((term: any) => toString(term, 0) || "").filter((t: string) => t !== "")
    },
    borrower: {
      fico: data.borrower?.fico || null,
      dtiRatio: toString(data.borrower?.dtiRatio, 0) || "",
      monthsOfReserves: data.borrower?.monthsOfReserves || 0,
      isNonOccupancyBorrower: data.borrower?.isNonOccupancyBorrower || false,
      isNonOccupancyCoborrower: data.borrower?.isNonOccupancyCoborrower || false,
      propertiesOwned: data.borrower?.propertiesOwned || 0,
      isSelfEmployed: data.borrower?.isSelfEmployed || false,
      multipleBorrowerPairs: data.borrower?.multipleBorrowerPairs || false,
      verificationMethod: data.borrower?.verificationMethod || "None",
      creditGrade: data.borrower?.creditGrade || "None",
      isNonTraditionalCredit: data.borrower?.isNonTraditionalCredit || false,
      isGiftFunds: data.borrower?.isGiftFunds || false,
      residualIncome: data.borrower?.residualIncome || 0,
      firstName: data.borrower?.firstName || "",
      lastName: data.borrower?.lastName || "",
      isFirstTimeHomeBuyer: data.borrower?.isFirstTimeHomeBuyer || false,
      investorExperience: data.borrower?.investorExperience === "NotApplicable" ? 0 : data.borrower?.investorExperience || 0,
      fullDocMonths: data.borrower?.fullDocMonths || 0,
      cpaPandLMonths: data.borrower?.cpaPandLMonths || 0,
      annualIncome: data.borrower?.annualIncome || 0
    },
    loan: {
      purpose: data.loan?.purpose || "Purchase",
      amount: toNumber(data.loan?.amount),
      purchasePrice: toNumber(data.loan?.purchasePrice),
      propertyValue: toNumber(data.loan?.propertyValue || data.loan?.purchasePrice),
      refinancePurpose: 0,
      cashOutAmount: toNumber(data.loan?.cashOutAmount) || 0,
      secondAmount: toNumber(data.loan?.secondAmount),
      helocLineAmount: toNumber(data.loan?.helocLineAmount) || 0,
      helocDrawAmount: toNumber(data.loan?.helocDrawAmount),
      paidByBorrower: data.loan?.isMortgageInsurancePaidByBorrower !== false,
      aus: data.loan?.aus || "NotSpecified",
      position: data.loan?.position || "First",
      prepaymentPenaltyPeriodMonths: data.loan?.prepaymentPenaltyPeriodMonths,
      fhaFinancingOption: data.loan?.fhaFinancingOption || "Finance",
      fhaMortgageInsurancePremium: toNumber(data.loan?.fhaMortgageInsurancePremium) || 0,
      fhaMortgageInsurancePremiumAmount: toNumber(data.loan?.fhaMortgageInsurancePremiumAmount) || 0,
      fhaTotalLoanAmount: toNumber(data.loan?.fhaTotalLoanAmount) || 0,
      fhaFinanceAmount: toNumber(data.loan?.fhaFinanceAmount) || 0,
      usdaFinancingOption: data.loan?.usdaFinancingOption || "Finance",
      usdaGuaranteeFee: toNumber(data.loan?.usdaGuaranteeFee) || 0,
      usdaGuaranteeFeeAmount: toNumber(data.loan?.usdaGuaranteeFeeAmount) || 0,
      usdaTotalLoanAmount: toNumber(data.loan?.usdaTotalLoanAmount) || 0,
      usdaFinanceAmount: toNumber(data.loan?.usdaFinanceAmount) || 0,
      vaFinancingOption: data.loan?.vaFinancingOption || "Finance",
      vaDownPaymentAmount: toNumber(data.loan?.vaDownPaymentAmount) || 0,
      vaLoanHistory: data.loan?.vaLoanHistory || "First",
      vaFundingFee: toNumber(data.loan?.vaFundingFee) || 0,
      vaFundingFeeAmount: toNumber(data.loan?.vaFundingFeeAmount) || 0,
      vaTotalLoanAmount: toNumber(data.loan?.vaTotalLoanAmount) || 0,
      vaFinanceAmount: toNumber(data.loan?.vaFinanceAmount) || 0,
      vaFundingFeeExempt: data.loan?.vaFundingFeeExempt || false,
      vaCashoutLTV: toNumber(data.loan?.vaCashoutLTV) || 0,
      vaCashoutCLTV: toNumber(data.loan?.vaCashoutCLTV) || 0,
      vaCashoutHCLTV: toNumber(data.loan?.vaCashoutHCLTV) || 0,
      vaDownPayment: toNumber(data.loan?.vaDownPayment) || 0,
      applicationDate: data.loan?.applicationDate,
      streamlineRefinanceType: data.loan?.streamlineRefinanceType,
      temporaryBuydownType: data.loan?.temporaryBuydownType,
      fhaPriorEndorsementDate: data.loan?.fhaPriorEndorsementDate,
      ltv: toString(data.loan?.ltv) || "",
      cltv: toString(data.loan?.cltv) || "",
      hcltv: toString(data.loan?.hcltv) || "",
      isMortgageInsurancePaidByBorrower: data.loan?.isMortgageInsurancePaidByBorrower !== false,
      impounds: data.loan?.impounds || "Full"
    },
    property: {
      state: data.property?.state || "",
      county: data.property?.county || "",
      propertyType: data.property?.propertyType || "SFR",
      occupancy: data.property?.occupancy || "PrimaryResidence",
      units: data.property?.units || 1,
      stories: data.property?.stories || 1,
      isNonWarrantableProject: data.property?.isNonWarrantableProject,
      isCondotel: data.property?.isCondotel,
      inspectionWaiver: data.property?.inspectionWaiver || false,
      addressLine1: data.property?.addressLine1 || "",
      addressLine2: data.property?.addressLine2,
      city: data.property?.city || "",
      countyFipsCode: data.property?.countyFipsCodeOnly || data.property?.countyFipsCode?.slice(-3),
      zipCode: data.property?.zipCode || "",
      propertyAttachmentType: data.property?.propertyAttachmentType || "Unspecified",
      EstimatedValue: toNumber(data.property?.estimatedValue)
    },
    brokerCompPlan: {
      fixedAmount: toNumber(data.brokerCompPlan?.fixedAmount),
      percent: toNumber(data.brokerCompPlan?.percent),
      minAmount: toNumber(data.brokerCompPlan?.minAmount),
      maxAmount: toNumber(data.brokerCompPlan?.maxAmount),
      calculatedAmount: toNumber(data.brokerCompPlan?.calculatedAmount) || 0,
      paidBy: data.brokerCompPlan?.paidBy || "Lender",
      calculatedAdjustment: toNumber(data.brokerCompPlan?.calculatedAdjustment) || 0
    },
    customValues: data.customValues || [],
    adjustments: data.adjustments || [],
    settings: {
      operations: data.settings?.operations || ["Eligibility", "Pricing"],
      returnTerseResponse: data.settings?.returnTerseResponse !== false,
      returnTerseProductResponse: data.settings?.returnTerseProductResponse || false,
      returnIneligibleProducts: data.settings?.returnIneligibleProducts || false
    }
  };
}

/**
 * CONVERSION 2: getLoan Response → External API /pricing-scenario Request
 */
export function getLoanToExternalPricingScenario(loanData: any) {
  return {
    audienceId: "Retail",
    search: {
      position: loanData.position || "FIRST",
      desiredLockPeriod: 30,
      includeInterestOnlyProducts: false,
      loanTypes: [],
      amortizationTypes: [],
      loanTerms: loanData.loanTerm ? [toString(loanData.loanTerm, 0)] : [],
      armFixedTerms: loanData.armFixedTerm ? [toString(loanData.armFixedTerm, 0)] : []
    },
    borrower: {
      fico: loanData.borrower?.fico || null,
      dtiRatio: loanData.borrower?.dtiRatio || "",
      monthsOfReserves: loanData.borrower?.monthsOfReserves || 0,
      isNonOccupancyBorrower: loanData.borrower?.isNonOccupancyBuyer || false,
      isNonOccupancyCoborrower: loanData.borrower?.isNonOccupancyCoborrower || false,
      propertiesOwned: loanData.borrower?.propertiesOwned || 0,
      isSelfEmployed: loanData.borrower?.isSelfEmployed || false,
      multipleBorrowerPairs: loanData.borrower?.multipleBorrowerPairs || false,
      verificationMethod: loanData.borrower?.verificationMethod || "None",
      creditGrade: loanData.borrower?.creditGrade || "None",
      isNonTraditionalCredit: loanData.borrower?.isNonTraditionalCredit || false,
      isGiftFunds: loanData.borrower?.isGiftFunds || false,
      residualIncome: 0,
      firstName: loanData.borrower?.firstName || "",
      lastName: loanData.borrower?.lastName || "",
      isFirstTimeHomeBuyer: loanData.borrower?.isFirstTimeHomeBuyer || false,
      investorExperience: 0,
      fullDocMonths: loanData.borrower?.fullDocMonths || 0,
      cpaPandLMonths: loanData.borrower?.cpaPandLMonths || 0,
      annualIncome: toNumber(loanData.borrower?.incomeMonthly) ? (toNumber(loanData.borrower.incomeMonthly)! * 12) : 0
    },
    loan: {
      purpose: loanData.purpose || "PURCHASE",
      amount: toNumber(loanData.amount),
      purchasePrice: toNumber(loanData.purchasePrice),
      propertyValue: toNumber(loanData.propertyValue || loanData.purchasePrice),
      refinancePurpose: 0,
      cashOutAmount: toNumber(loanData.cashOutAmount) || 0,
      secondAmount: toNumber(loanData.secondAmount),
      helocLineAmount: toNumber(loanData.helocLineAmount) || 0,
      helocDrawAmount: toNumber(loanData.helocDrawAmount),
      paidByBorrower: loanData.isMortgageInsurancePaidByBorrower !== false,
      aus: loanData.aus === "NOT_SPECIFIED" ? "NotSpecified" : loanData.aus,
      position: loanData.position || "FIRST",
      prepaymentPenaltyPeriodMonths: loanData.prepaymentPenaltyPeriodMonths,
      fhaFinancingOption: loanData.fhaFinancingOption || "Finance",
      fhaMortgageInsurancePremium: toNumber(loanData.fhaMortgageInsurancePremiumPercentage) || 0,
      fhaMortgageInsurancePremiumAmount: toNumber(loanData.fhaMortgageInsurancePremiumAmount) || 0,
      fhaTotalLoanAmount: toNumber(loanData.fhaTotalLoanAmount) || 0,
      fhaFinanceAmount: 0,
      usdaFinancingOption: loanData.usdaFinancingOption || "Finance",
      usdaGuaranteeFee: 0,
      usdaGuaranteeFeeAmount: toNumber(loanData.usdaGuaranteeFeeAmount) || 0,
      usdaTotalLoanAmount: toNumber(loanData.usdaTotalLoanAmount) || 0,
      usdaFinanceAmount: 0,
      vaFinancingOption: loanData.vaFinancingOption || "Finance",
      vaDownPaymentAmount: toNumber(loanData.vaDownPaymentAmount) || 0,
      vaLoanHistory: loanData.vaLoanHistory || "First",
      vaFundingFee: toNumber(loanData.vaFundingFeePercentage) || 0,
      vaFundingFeeAmount: toNumber(loanData.vaFundingFeeAmount) || 0,
      vaTotalLoanAmount: toNumber(loanData.vaTotalLoanAmount) || 0,
      vaFinanceAmount: 0,
      vaFundingFeeExempt: loanData.isVaFundingFeeExempt || false,
      vaCashoutLTV: 0,
      vaCashoutCLTV: 0,
      vaCashoutHCLTV: 0,
      vaDownPayment: 0,
      applicationDate: loanData.applicationDate,
      streamlineRefinanceType: loanData.streamlineRefinanceType,
      temporaryBuydownType: loanData.temporaryBuydownType,
      fhaPriorEndorsementDate: null,
      ltv: loanData.ltv,
      cltv: loanData.cltv,
      hcltv: loanData.hcltv,
      isMortgageInsurancePaidByBorrower: loanData.isMortgageInsurancePaidByBorrower !== false,
      impounds: loanData.impoundType === "FULL" ? "Full" : loanData.impoundType || "Full"
    },
    property: {
      state: loanData.property?.state || "",
      county: loanData.property?.county || "",
      propertyType: loanData.property?.propertyType || "SFR",
      occupancy: loanData.property?.occupancy || "PRIMARY",
      units: loanData.property?.units || 1,
      stories: loanData.property?.stories || 1,
      isNonWarrantableProject: loanData.property?.isNonWarrantableProject,
      isCondotel: loanData.property?.isCondotel,
      inspectionWaiver: loanData.property?.inspectionWaiver || false,
      addressLine1: loanData.property?.addressLine1 || "",
      addressLine2: loanData.property?.addressLine2,
      city: loanData.property?.city || "",
      countyFipsCode: loanData.property?.countyFipsCodeOnly || loanData.property?.countyFipsCode?.slice(-3),
      zipCode: loanData.property?.zipCode || "",
      propertyAttachmentType: loanData.property?.propertyAttachmentType || "DETACHED",
      EstimatedValue: toNumber(loanData.property?.estimatedValue || loanData.propertyValue)
    },
    brokerCompPlan: {
      fixedAmount: null,
      percent: null,
      minAmount: null,
      maxAmount: null,
      calculatedAmount: 0,
      paidBy: "Lender",
      calculatedAdjustment: 0
    },
    customValues: loanData.customValues ? Object.entries(loanData.customValues).map(([name, value]) => ({
      name,
      value
    })) : [],
    adjustments: [],
    settings: {
      operations: ["Eligibility", "Pricing"],
      returnTerseResponse: true,
      returnTerseProductResponse: false,
      returnIneligibleProducts: false
    }
  };
}

/**
 * CONVERSION 3: External API /pricing-scenario Request → getLoan Request
 */
export function externalToGetLoan(externalRequest: any) {
  return {
    borrower: {
      firstName: externalRequest.borrower?.firstName || "",
      lastName: externalRequest.borrower?.lastName || "",
      fico: externalRequest.borrower?.fico || null,
      dtiRatio: toString(externalRequest.borrower?.dtiRatio || 0) || "0",
      assetDepletionAmount: null,
      assetDocumentation: null,
      assetQualificationAmount: null,
      bankStatementExpenseMethod: null,
      businessBankStatementMonths: null,
      citizenship: null,
      creditGrade: externalRequest.borrower?.creditGrade || null,
      debtServiceCoverageRatio: null,
      employmentVerification: null,
      fullDocMonths: externalRequest.borrower?.fullDocMonths || null,
      isNonOccupancyCoborrower: externalRequest.borrower?.isNonOccupancyCoborrower || false,
      isGiftFunds: externalRequest.borrower?.isGiftFunds || false,
      multipleBorrowerPairs: externalRequest.borrower?.multipleBorrowerPairs || false,
      isNonTraditionalCredit: externalRequest.borrower?.isNonTraditionalCredit || false,
      incomeMonthly: externalRequest.borrower?.annualIncome ? (toString(externalRequest.borrower.annualIncome / 12) || null) : null,
      incomeDocumentation: null,
      isFirstTimeHomeBuyer: externalRequest.borrower?.isFirstTimeHomeBuyer || false,
      isNonOccupancyBuyer: externalRequest.borrower?.isNonOccupancyBorrower || false,
      isSelfEmployed: externalRequest.borrower?.isSelfEmployed || false,
      months1099: null,
      cpaPandLMonths: externalRequest.borrower?.cpaPandLMonths || null,
      bankStatementsNumberOfMonthsPersonal: null,
      propertiesOwned: externalRequest.borrower?.propertiesOwned || 0,
      monthsOfReserves: externalRequest.borrower?.monthsOfReserves || 0,
      verificationMethod: externalRequest.borrower?.verificationMethod || "FULL",
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
      name: "",
      email: "",
      assistantEmail: null
    },
    property: {
      addressLine1: externalRequest.property?.addressLine1 || "",
      addressLine2: externalRequest.property?.addressLine2 || "",
      appraisedValue: null,
      city: externalRequest.property?.city || "",
      county: externalRequest.property?.county || "",
      countyFipsCode: externalRequest.property?.countyFipsCode || "",
      countyFipsCodeOnly: null,
      isHighCostCounty: null,
      estimatedValue: toString(externalRequest.property?.EstimatedValue) || null,
      inspectionWaiver: externalRequest.property?.inspectionWaiver || null,
      isCondotel: externalRequest.property?.isCondotel || null,
      isDecliningMarket: null,
      isNonWarrantableProject: externalRequest.property?.isNonWarrantableProject || null,
      lotSizeInAcres: null,
      occupancy: toScreamingSnakeCase(externalRequest.property?.occupancy) || "PRIMARY",
      propertyType: externalRequest.property?.propertyType || "SFR",
      propertyAttachmentType: toScreamingSnakeCase(externalRequest.property?.propertyAttachmentType) || "DETACHED",
      state: externalRequest.property?.state || "",
      stateFipsCode: "",
      stories: externalRequest.property?.stories || 1,
      units: externalRequest.property?.units || 1,
      zipCode: externalRequest.property?.zipCode || "",
      zipCodePlusFour: null,
      msaCode: null,
      censusTract: null,
      medianIncome: null
    },
    customValues: externalRequest.customValues || null,
    externalCreatedAt: new Date().toISOString(),
    externalModifiedAt: new Date().toISOString(),
    loanNumber: "",
    purpose: toScreamingSnakeCase(externalRequest.loan?.purpose) || "PURCHASE",
    amount: toString(externalRequest.loan?.amount) || "0.0000",
    rate: null,
    productName: "",
    productCode: "",
    aus: toScreamingSnakeCase(externalRequest.loan?.aus === "NotSpecified" ? "NOT_SPECIFIED" : externalRequest.loan?.aus),
    applicationDate: externalRequest.loan?.applicationDate || null,
    fundedAt: null,
    ltv: externalRequest.loan?.ltv || "0.0000",
    cltv: externalRequest.loan?.cltv || "0.0000",
    hcltv: externalRequest.loan?.hcltv || "0.0000",
    amortizationType: null,
    documentationType: null,
    cashOutAmount: toString(externalRequest.loan?.cashOutAmount) || "0.0000",
    fhaCaseAssignmentDate: null,
    fhaTotalLoanAmount: toString(externalRequest.loan?.fhaTotalLoanAmount) || null,
    helocDrawAmount: toString(externalRequest.loan?.helocDrawAmount) || null,
    helocLineAmount: toString(externalRequest.loan?.helocLineAmount) || "0.0000",
    isRelocationLoan: null,
    lenderFee: null,
    isMortgageInsurancePaidByBorrower: externalRequest.loan?.isMortgageInsurancePaidByBorrower !== false,
    prepaymentPenaltyPeriodMonths: externalRequest.loan?.prepaymentPenaltyPeriodMonths || null,
    prepaymentPenaltyStructure: null,
    prepaymentPenaltyStructureType: null,
    propertyValue: toString(externalRequest.loan?.propertyValue) || "0.0000",
    purchasePrice: toString(externalRequest.loan?.purchasePrice) || "0.0000",
    refinancePurpose: "NONE",
    secondAmount: toString(externalRequest.loan?.secondAmount) || null,
    position: toScreamingSnakeCase(externalRequest.loan?.position) || "FIRST",
    isSecondInvestorSameAsFirst: null,
    isSecondCommunityLoan: null,
    isSecondPiggyback: null,
    servicerName: "",
    temporaryBuydownType: externalRequest.loan?.temporaryBuydownType || null,
    loanTerm: externalRequest.search?.loanTerms?.[0] ? parseInt(externalRequest.search.loanTerms[0]) : null,
    loanType: externalRequest.search?.loanTypes?.[0] || null,
    usdaTotalLoanAmount: toString(externalRequest.loan?.usdaTotalLoanAmount) || null,
    vaTotalLoanAmount: toString(externalRequest.loan?.vaTotalLoanAmount) || null,
    impoundType: externalRequest.loan?.impounds === "Full" ? "FULL" : toScreamingSnakeCase(externalRequest.loan?.impounds),
    rollLenderFee: null,
    streamlineRefinanceType: externalRequest.loan?.streamlineRefinanceType || null,
    armFixedTerm: externalRequest.search?.armFixedTerms?.[0] ? parseInt(externalRequest.search.armFixedTerms[0]) : null,
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    losLoanId: ""
  };
}


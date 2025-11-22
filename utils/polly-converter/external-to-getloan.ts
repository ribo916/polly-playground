/* eslint-disable @typescript-eslint/no-explicit-any */

/* external-to-getloan.ts
 * ------------------------------------------------------
 * Converts External PricingScenarioRequest → Loan Service ApiLoan
 * Self-contained. No imports. No shared.ts.
 */

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const toDecimalStringOrNull = (val: unknown): string | null => {
    if (val === null || val === undefined || val === "") return null;
    if (typeof val === "string") return val;
    if (typeof val === "number") return val.toFixed(4).replace(/\.?0+$/, "");
    return String(val);
  };
  
  const pascalToScreaming = (value: unknown): string | null => {
    if (value === null || value === undefined) return null;
    return String(value)
      .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
      .toUpperCase();
  };
  
  /* ------------------------------------------------------------------ */
  /* MAIN CONVERTER                                                     */
  /* ------------------------------------------------------------------ */
  
  export function externalToGetLoan(externalRequest: any) {
    const borrower = externalRequest.borrower || {};
    const loan = externalRequest.loan || {};
    const property = externalRequest.property || {};
  
    return {
      borrower: {
        firstName: borrower.firstName || "",
        lastName: borrower.lastName || "",
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
        isNonOccupancyCoborrower:
          borrower.isNonOccupancyCoborrower ?? false,
        isGiftFunds: borrower.isGiftFunds ?? false,
        multipleBorrowerPairs:
          borrower.multipleBorrowerPairs ?? false,
        isNonTraditionalCredit:
          borrower.isNonTraditionalCredit ?? false,
  
        incomeMonthly: borrower.annualIncome
          ? toDecimalStringOrNull(
              (borrower.annualIncome as number) / 12
            )
          : null,
  
        isFirstTimeHomeBuyer:
          borrower.isFirstTimeHomeBuyer ?? false,
        isNonOccupancyBuyer:
          borrower.isNonOccupancyBorrower ?? false,
        isSelfEmployed: borrower.isSelfEmployed ?? false,
        cpaPandLMonths: borrower.cpaPandLMonths ?? null,
        propertiesOwned: borrower.propertiesOwned ?? 0,
        monthsOfReserves: borrower.monthsOfReserves ?? 0,
  
        verificationMethod:
          pascalToScreaming(borrower.verificationMethod) || null,
  
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
        addressLine1: property.addressLine1 || "",
        addressLine2: property.addressLine2 || "",
        appraisedValue: toDecimalStringOrNull(property.appraisedValue),
        city: property.city || "",
        county: property.county || "",
        countyFipsCode: property.countyFipsCode || "",
        countyFipsCodeOnly: null,
        isHighCostCounty:
          property.isHighCostCounty ?? null,
        estimatedValue: toDecimalStringOrNull(
          property.estimatedValue
        ),
        inspectionWaiver: property.inspectionWaiver ?? null,
        isCondotel: property.isCondotel ?? null,
        isDecliningMarket:
          property.isDecliningMarket ?? null,
        isNonWarrantableProject:
          property.isNonWarrantableProject ?? null,
        lotSizeInAcres: toDecimalStringOrNull(
          property.lotSizeInAcres
        ),
        occupancy:
          pascalToScreaming(property.occupancy) ||
          "PRIMARY",
        propertyType:
          pascalToScreaming(property.propertyType) ||
          "SFR",
        propertyAttachmentType:
          pascalToScreaming(
            property.propertyAttachmentType
          ),
        state: property.state || "",
        stateFipsCode: "",
        stories: property.stories ?? 1,
        units: property.units ?? 1,
        zipCode: property.zipCode || "",
        zipCodePlusFour:
          property.zipCodePlusFour || null,
        msaCode: null,
        censusTract: null,
        medianIncome: toDecimalStringOrNull(
          property.medianIncome
        )
      },
  
      customValues:
        externalRequest.customValues || null,
  
      externalCreatedAt: new Date().toISOString(),
      externalModifiedAt: new Date().toISOString(),
  
      loanNumber: "",
      purpose:
        pascalToScreaming(externalRequest.purpose) ||
        "PURCHASE",
      amount: toDecimalStringOrNull(loan.amount) || "0.0000",
      rate: null,
      productName: "",
      productCode: "",
      aus:
        pascalToScreaming(loan.aus) || "NOT_SPECIFIED",
      applicationDate: loan.applicationDate || null,
      fundedAt: null,
      ltv: toDecimalStringOrNull(loan.ltv) || "0.0000",
      cltv: toDecimalStringOrNull(loan.cltv) || "0.0000",
      hcltv: toDecimalStringOrNull(loan.hcltv) || "0.0000",
  
      amortizationType: null,
      documentationType: null,
  
      cashOutAmount:
        toDecimalStringOrNull(loan.cashOutAmount) ||
        "0.0000",
  
      fhaCaseAssignmentDate:
        loan.fhaPriorEndorsementDate || null,
  
      fhaTotalLoanAmount:
        toDecimalStringOrNull(loan.fhaTotalLoanAmount),
  
      helocDrawAmount:
        toDecimalStringOrNull(loan.helocDrawAmount),
  
      helocLineAmount:
        toDecimalStringOrNull(loan.helocLineAmount) ||
        "0.0000",
  
      isRelocationLoan: null,
  
      lenderFee: toDecimalStringOrNull(loan.lenderFee),
  
      isMortgageInsurancePaidByBorrower:
        loan.isMortgageInsurancePaidByBorrower !==
        false,
  
      prepaymentPenaltyPeriodMonths:
        loan.prepaymentPenaltyPeriodMonths || null,
  
      prepaymentPenaltyStructure:
        pascalToScreaming(
          loan.prepaymentPenaltyStructure
        ) || null,
  
      prepaymentPenaltyStructureType:
        pascalToScreaming(
          loan.prepaymentPenaltyStructureType
        ) || null,
  
      propertyValue:
        toDecimalStringOrNull(loan.propertyValue) ||
        "0.0000",
  
      purchasePrice:
        toDecimalStringOrNull(loan.purchasePrice) ||
        "0.0000",
  
      refinancePurpose: "NONE",
  
      secondAmount:
        toDecimalStringOrNull(loan.secondAmount),
  
      position:
        pascalToScreaming(loan.position) || "FIRST",
  
      isSecondInvestorSameAsFirst:
        loan.isSecondInvestorSameAsFirst ?? null,
      isSecondCommunityLoan:
        loan.isSecondCommunityLoan ?? null,
      isSecondPiggyback:
        loan.isSecondPiggyback ?? null,
  
      servicerName: "",
  
      temporaryBuydownType:
        pascalToScreaming(
          loan.temporaryBuydownType
        ) || null,
  
      loanTerm: loan.loanTerm ?? null,
      loanType: pascalToScreaming(loan.loanType),
  
      usdaTotalLoanAmount: toDecimalStringOrNull(
        loan.usdaTotalLoanAmount
      ),
  
      vaTotalLoanAmount: toDecimalStringOrNull(
        loan.vaTotalLoanAmount
      ),
  
      impoundType:
        pascalToScreaming(loan.impounds) || "FULL",
  
      rollLenderFee: loan.rollLenderFee ?? null,
  
      streamlineRefinanceType:
        pascalToScreaming(
          loan.streamlineRefinanceType
        ) || null,
  
      armFixedTerm: loan.armFixedTerm ?? null,
  
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
  
      losLoanId: ""
    };
  }
  
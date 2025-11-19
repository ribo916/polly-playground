// app/loan-pipeline/data/CreateLoanFieldConfig.ts

export type FieldGroup = "required" | "requiredNullable" | "optional";

export type FieldInputType =
  | "string"
  | "decimal"
  | "boolean"
  | "integer"
  | "date"
  | "date-time"
  | "enum"
  | "object";

export interface FieldDefinition {
  /** Flattened key, e.g. "losLoanId" or "borrower.firstName" */
  key: string;
  /** Human-friendly label for the UI */
  label: string;
  /** Required non-null, required nullable, or optional */
  group: FieldGroup;
  /** Primitive type to drive input widget */
  type: FieldInputType;
  /** Whether the field may be null in the API */
  nullable: boolean;
  /** Enum values from Swagger (including null where allowed) */
  enumValues?: (string | null)[];
  /** Suggested placeholder for required non-nullable fields */
  placeholder?: string;
}

/**
 * These definitions are derived from the CreateLoanRequest schema you pasted.
 * They only cover top-level fields on the loan request.
 *
 * Nested objects (borrower, property, loanofficer) are represented here as
 * type "object". We’ll continue to source their inner fields from your
 * sample payload for now, and wire that up in the modal.
 */
export const createLoanFieldDefinitions: FieldDefinition[] = [
  // ---------- REQUIRED + NON-NULLABLE ----------

  {
    key: "losLoanId",
    label: "LOS Loan ID",
    group: "required",
    type: "string",
    nullable: false,
    placeholder: "LOS-123456",
  },
  {
    key: "loanNumber",
    label: "Loan Number",
    group: "required",
    type: "string",
    nullable: false,
    placeholder: "1234567890",
  },
  {
    key: "externalCreatedAt",
    label: "External Created At",
    group: "required",
    type: "date-time",
    nullable: false,
    placeholder: "2025-01-01T00:00:00Z",
  },
  {
    key: "externalModifiedAt",
    label: "External Modified At",
    group: "required",
    type: "date-time",
    nullable: false,
    placeholder: "2025-01-01T00:00:00Z",
  },
  {
    key: "amount",
    label: "Loan Amount",
    group: "required",
    type: "decimal",
    nullable: false,
    placeholder: "200000.00",
  },
  {
    key: "ltv",
    label: "LTV",
    group: "required",
    type: "decimal",
    nullable: false,
    placeholder: "80.00",
  },
  {
    key: "cltv",
    label: "CLTV",
    group: "required",
    type: "decimal",
    nullable: false,
    placeholder: "80.00",
  },
  {
    key: "hcltv",
    label: "HCLTV",
    group: "required",
    type: "decimal",
    nullable: false,
    placeholder: "80.00",
  },
  {
    key: "propertyValue",
    label: "Property Value",
    group: "required",
    type: "decimal",
    nullable: false,
    placeholder: "250000.00",
  },
  {
    key: "purpose",
    label: "Purpose",
    group: "required",
    type: "enum",
    nullable: false,
    enumValues: [
      "NONE",
      "PURCHASE",
      "REFINANCE",
      "CONSTRUCTION",
      "CONSTRUCTION_PERM",
      "OTHER",
      "NO_CASH_OUT_REFINANCE",
      "CASH_OUT_REFINANCE",
    ],
    placeholder: "PURCHASE",
  },
  // Required non-nullable objects (we’ll still rely on your sample payload to
  // fill their inner fields; this just ensures they’re treated as required)
  {
    key: "borrower",
    label: "Borrower",
    group: "required",
    type: "object",
    nullable: false,
  },
  {
    key: "loanofficer",
    label: "Loan Officer",
    group: "required",
    type: "object",
    nullable: false,
  },
  {
    key: "property",
    label: "Property",
    group: "required",
    type: "object",
    nullable: false,
  },

  // ---------- REQUIRED + NULLABLE ----------

  {
    key: "amortizationType",
    label: "Amortization Type",
    group: "requiredNullable",
    type: "enum",
    nullable: true,
    enumValues: ["NONE", "FIXED", "ARM", "BALLOON", "OPTION_ARM", null],
  },
  {
    key: "aus",
    label: "AUS",
    group: "requiredNullable",
    type: "enum",
    nullable: true,
    enumValues: [
      "NONE",
      "MANUAL",
      "DU",
      "LP",
      "OTHER",
      "NOT_SPECIFIED",
      null,
    ],
  },
  {
    key: "cashOutAmount",
    label: "Cash Out Amount",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },
  {
    key: "customValues",
    label: "Custom Values",
    group: "requiredNullable",
    type: "object",
    nullable: true,
  },
  {
    key: "documentationType",
    label: "Documentation Type",
    group: "requiredNullable",
    type: "enum",
    nullable: true,
    enumValues: ["STREAMLINE_REFINANCE", "FULL_DOCUMENTATION", null],
  },
  {
    key: "fhaTotalLoanAmount",
    label: "FHA Total Loan Amount",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },
  {
    key: "fundedAt",
    label: "Funded At",
    group: "requiredNullable",
    type: "date-time",
    nullable: true,
  },
  {
    key: "helocDrawAmount",
    label: "HELOC Draw Amount",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },
  {
    key: "helocLineAmount",
    label: "HELOC Line Amount",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },
  {
    key: "impoundType",
    label: "Impound Type",
    group: "requiredNullable",
    type: "enum",
    nullable: true,
    enumValues: ["NONE", "PARTIAL", "FULL", null],
  },
  {
    key: "isMortgageInsurancePaidByBorrower",
    label: "Is MI Paid By Borrower",
    group: "requiredNullable",
    type: "boolean",
    nullable: true,
  },
  {
    key: "isRelocationLoan",
    label: "Is Relocation Loan",
    group: "requiredNullable",
    type: "boolean",
    nullable: true,
  },
  {
    key: "isSecondCommunityLoan",
    label: "Is Second Community Loan",
    group: "requiredNullable",
    type: "boolean",
    nullable: true,
  },
  {
    key: "isSecondInvestorSameAsFirst",
    label: "Is Second Investor Same As First",
    group: "requiredNullable",
    type: "boolean",
    nullable: true,
  },
  {
    key: "isSecondPiggyback",
    label: "Is Second Piggyback",
    group: "requiredNullable",
    type: "boolean",
    nullable: true,
  },
  {
    key: "lenderFee",
    label: "Lender Fee",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },
  {
    key: "loanTerm",
    label: "Loan Term (months)",
    group: "requiredNullable",
    type: "integer",
    nullable: true,
  },
  {
    key: "loanType",
    label: "Loan Type",
    group: "requiredNullable",
    type: "enum",
    nullable: true,
    enumValues: [
      "NONE",
      "CONVENTIONAL",
      "FHA",
      "VA",
      "USDA",
      "JUMBO",
      "NON_QM",
      "HELOC",
      null,
    ],
  },
  {
    key: "position",
    label: "Lien Position",
    group: "requiredNullable",
    type: "enum",
    nullable: true,
    enumValues: ["FIRST", "SECOND", "HELOC", "THIRD", null],
  },
  {
    key: "prepaymentPenaltyPeriodMonths",
    label: "Prepayment Penalty Period (months)",
    group: "requiredNullable",
    type: "integer",
    nullable: true,
  },
  {
    key: "productCode",
    label: "Product Code",
    group: "requiredNullable",
    type: "string",
    nullable: true,
  },
  {
    key: "productName",
    label: "Product Name",
    group: "requiredNullable",
    type: "string",
    nullable: true,
  },
  {
    key: "purchasePrice",
    label: "Purchase Price",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },
  {
    key: "rate",
    label: "Note Rate",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },
  {
    key: "refinancePurpose",
    label: "Refinance Purpose",
    group: "requiredNullable",
    type: "enum",
    nullable: true,
    enumValues: [
      "NONE",
      "NO_CASH_OUT",
      "CASH_OUT",
      "LIMITED_CASH_OUT",
      "HOME_IMPROVEMENT",
      "DEBT_CONSOLIDATION",
      "OTHER",
      null,
    ],
  },
  {
    key: "rollLenderFee",
    label: "Roll Lender Fee",
    group: "requiredNullable",
    type: "boolean",
    nullable: true,
  },
  {
    key: "secondAmount",
    label: "Second Amount",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },
  {
    key: "temporaryBuydownType",
    label: "Temporary Buydown Type",
    group: "requiredNullable",
    type: "enum",
    nullable: true,
    enumValues: [
      "NONE",
      "THREE_TWO_ONE",
      "TWO_ONE",
      "ONE_ONE",
      "ONE_ZERO",
      null,
    ],
  },
  {
    key: "usdaTotalLoanAmount",
    label: "USDA Total Loan Amount",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },
  {
    key: "vaTotalLoanAmount",
    label: "VA Total Loan Amount",
    group: "requiredNullable",
    type: "decimal",
    nullable: true,
  },

  // ---------- OPTIONAL (NOT IN required[]) ----------

  {
    key: "usdaFinancedAmount",
    label: "USDA Financed Amount",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "vaFinancedAmount",
    label: "VA Financed Amount",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "vaCashFundingFeeAmount",
    label: "VA Cash Funding Fee Amount",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "fhaMortgageInsurancePremiumPercentage",
    label: "FHA MIP Percentage",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "usdaGuaranteedPercentage",
    label: "USDA Guaranteed Percentage",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "vaFundingFeePercentage",
    label: "VA Funding Fee Percentage",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "fhaFinancingOption",
    label: "FHA Financing Option",
    group: "optional",
    type: "enum",
    nullable: true,
    enumValues: ["FINANCE", "PAID_IN_CASH", null],
  },
  {
    key: "fhaMortgageInsurancePremiumAmount",
    label: "FHA MIP Amount",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "fhaTltv",
    label: "FHA TLTV",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "usdaFinancingOption",
    label: "USDA Financing Option",
    group: "optional",
    type: "enum",
    nullable: true,
    enumValues: ["FINANCE", "PAID_IN_CASH", null],
  },
  {
    key: "usdaGuaranteeFeeAmount",
    label: "USDA Guarantee Fee Amount",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "usdaTltv",
    label: "USDA TLTV",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "vaFinancingOption",
    label: "VA Financing Option",
    group: "optional",
    type: "enum",
    nullable: true,
    enumValues: ["FINANCE", "PAID_IN_CASH", null],
  },
  {
    key: "vaFundingFeeAmount",
    label: "VA Funding Fee Amount",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "isVaFundingFeeExempt",
    label: "Is VA Funding Fee Exempt",
    group: "optional",
    type: "boolean",
    nullable: true,
  },
  {
    key: "vaLoanHistory",
    label: "VA Loan History",
    group: "optional",
    type: "enum",
    nullable: true,
    enumValues: ["FIRST_USE", "REPEAT_USE", null],
  },
  {
    key: "vaDownPaymentAmount",
    label: "VA Down Payment Amount",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "vaTltv",
    label: "VA TLTV",
    group: "optional",
    type: "decimal",
    nullable: true,
  },
  {
    key: "applicationDate",
    label: "Application Date",
    group: "optional",
    type: "date",
    nullable: true,
  },
  {
    key: "fhaCaseAssignmentDate",
    label: "FHA Case Assignment Date",
    group: "optional",
    type: "date",
    nullable: true,
  },
  {
    key: "prepaymentPenaltyStructure",
    label: "Prepayment Penalty Structure",
    group: "optional",
    type: "enum",
    nullable: true,
    enumValues: [
      "NONE",
      "PPS_1",
      "PPS_1_1_1",
      "PPS_2_1",
      "PPS_2_2",
      "PPS_3_6_20",
      "PPS_3_6",
      "PPS_3_2_1",
      "PPS_3_3_3",
      "PPS_4_3_2_1",
      "PPS_4_4_4_4",
      "PPS_5",
      "PPS_5_4_3_2_1",
      "PPS_5_5",
      "PPS_5_5_4_4_3_2_1",
      "PPS_5_5_5",
      "PPS_5_5_5_5",
      "PPS_5_5_5_5_5",
      null,
    ],
  },
  {
    key: "prepaymentPenaltyStructureType",
    label: "Prepayment Penalty Structure Type",
    group: "optional",
    type: "enum",
    nullable: true,
    enumValues: [
      "NONE",
      "NO_PREPAY",
      "FIXED",
      "DECLINING",
      "SIX_MONTHS_INTEREST",
      null,
    ],
  },
  {
    key: "servicerName",
    label: "Servicer Name",
    group: "optional",
    type: "string",
    nullable: true,
  },
  {
    key: "streamlineRefinanceType",
    label: "Streamline Refinance Type",
    group: "optional",
    type: "enum",
    nullable: true,
    enumValues: [
      "NONE",
      "NO_CASHOUT_STREAMLINED_REFINANCE",
      "NO_CASHOUT_FHA_STREAMLINED_REFINANCE",
      null,
    ],
  },
  {
    key: "armFixedTerm",
    label: "ARM Fixed Term (months)",
    group: "optional",
    type: "integer",
    nullable: true,
  },
];

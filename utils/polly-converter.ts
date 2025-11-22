// polly-converter.ts
// ------------------------------------------------------
// Wrapper that exposes the 3 actual converters.
// Corrected to reference converters inside the folder.

import { uiToExternalPricingScenario } from './polly-converter/ui-to-external';
import { getLoanToExternalPricingScenario } from './polly-converter/getloan-to-external';
import { externalToGetLoan } from './polly-converter/external-to-getloan';

export {
  uiToExternalPricingScenario,
  getLoanToExternalPricingScenario,
  externalToGetLoan
};

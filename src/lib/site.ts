export const COMPANY_LETTERHEAD = {
  name: "Impress Blinds Ltd",
  addressLines: ["Unit C-41, Carlinghow Mills", "Bradford Road", "Batley WF17 8LL"],
  freePhone: "0800 233 55 66",
  mobile: "07443 581786",
  email: "info@impressblinds.co.uk",
  website: "www.impressblinds.co.uk",
  social: "Impress blinds",
  bankDetails: {
    accountNumber: "96752369",
    sortCode: "09 01 28",
  },
};

export const AGREEMENT_TEXT = [
  "I request the above goods to be supplied and I agree to pay the amount due in full at the time",
  "of fitting / delivery / collection. The goods on this order cannot be cancelled once manufacture",
  "has commenced.",
  "Specifications of your window(s) has been cancelled once manufacture has commenced.",
  "I have read & accept the terms & conditions.",
  "We do not accept cheques.",
];

export const CUSTOMER_CONFIRMATION_TEXT =
  "I am confirming the fabric name, colours, controls and rooms on this agreement are correct";

export const TERMS_SMALL_PRINT = [
  "Impress Blinds Ltd accepts no liability for any loss or damage caused to you or your property as a result",
  "of any breach of our obligation to exercise reasonable care and skill in the performance of this agreement,",
  "except that we do not exclude or limit our liability for death or personal injury caused by our negligence,",
  "nor for fraud or fraudulent misrepresentation, nor for breach of your legal rights in relation to the goods",
  "or services supplied, nor for defective products under the Consumer Protection Act 1987. Subject to the",
  "above, we shall not be responsible for any losses that arise as a side effect of our failure to comply with",
  "this agreement that were not foreseeable to both parties when this agreement was made, that were caused",
  "by an event outside our reasonable control, or that relate to a business, including (but not limited to)",
  "lost profits, loss of business, business interruption, or loss of business opportunity.",
];

export const PAYMENT_METHOD_LABELS: Record<"CARD" | "BT" | "CASH", string> = {
  CARD: "Card",
  BT: "Bank Transfer",
  CASH: "Cash",
};

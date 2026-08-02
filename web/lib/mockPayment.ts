export const MOCK_PAYMENT_CARDS = {
  success: {
    number: '4111111111111111',
    display: '4111 1111 1111 1111',
    label: 'Success card',
    description: 'Payment approves and booking is confirmed.',
  },
  decline: {
    number: '4000000000000002',
    display: '4000 0000 0000 0002',
    label: 'Decline card',
    description: 'Payment is rejected and booking fails.',
  },
} as const;

export type MockPaymentResult = 'success' | 'declined' | 'invalid';

export function normalizeCardNumber(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string): string {
  const digits = normalizeCardNumber(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function processMockPayment(cardNumber: string): MockPaymentResult {
  const normalized = normalizeCardNumber(cardNumber);

  if (normalized === MOCK_PAYMENT_CARDS.success.number) {
    return 'success';
  }

  if (normalized === MOCK_PAYMENT_CARDS.decline.number) {
    return 'declined';
  }

  return 'invalid';
}

export function validatePaymentForm(input: {
  cardName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}): string | null {
  if (!input.cardName.trim()) {
    return 'Cardholder name is required.';
  }

  const cardNumber = normalizeCardNumber(input.cardNumber);
  if (cardNumber.length !== 16) {
    return 'Enter a valid 16-digit card number.';
  }

  const expiryMatch = input.expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!expiryMatch) {
    return 'Expiry must be in MM/YY format.';
  }

  const month = Number(expiryMatch[1]);
  if (month < 1 || month > 12) {
    return 'Expiry month must be between 01 and 12.';
  }

  if (!/^\d{3,4}$/.test(input.cvc)) {
    return 'Enter a valid CVC.';
  }

  return null;
}

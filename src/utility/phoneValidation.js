export const PHONE_INPUT_PATTERN = "^\\+?[0-9()\\s.-]{10,}$";

export const PHONE_VALIDATION_MESSAGE =
  "Please enter a valid phone number with at least 10 digits.";

export const normalizePhoneNumber = (phone = "") => phone.replace(/\D/g, "");

export const isValidPhoneNumber = (phone = "") => {
  const trimmedPhone = phone.trim();
  if (!trimmedPhone) {
    return false;
  }

  const digits = normalizePhoneNumber(trimmedPhone);

  // Accept common North American and international-style numbers.
  // Minimum 10 digits, capped at 15 digits (E.164 max length).
  if (digits.length < 10 || digits.length > 15) {
    return false;
  }

  return /^[+]?[\d().\-\s]+$/.test(trimmedPhone);
};

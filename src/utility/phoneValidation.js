export const PHONE_INPUT_PATTERN =
  "^(?:\\+?1[\\s.-]?)?(?:\\([2-9]\\d{2}\\)|[2-9]\\d{2})[\\s.-]?\\d{3}[\\s.-]?\\d{4}$";

export const PHONE_VALIDATION_MESSAGE =
  "Please enter a valid 10-digit US phone number.";

export const normalizePhoneNumber = (phone = "") => phone.replace(/\D/g, "");

export const isValidPhoneNumber = (phone = "") => {
  const trimmedPhone = phone.trim();
  if (!trimmedPhone) {
    return false;
  }

  const digits = normalizePhoneNumber(trimmedPhone);

  // US-only support: either a straight 10-digit number or 11 digits with leading country code 1.
  const normalizedDigits =
    digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits;

  if (!/^\d{10}$/.test(normalizedDigits)) return false;

  // Reject area/exchange codes that cannot start with 0/1 (NANP rules).
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(normalizedDigits)) return false;

  return new RegExp(PHONE_INPUT_PATTERN).test(trimmedPhone);
};

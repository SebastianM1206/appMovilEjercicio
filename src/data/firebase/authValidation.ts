import { MAX_DISPLAY_NAME_LENGTH, MIN_PASSWORD_LENGTH } from './integrity';

export { MAX_DISPLAY_NAME_LENGTH, MIN_PASSWORD_LENGTH };

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type AuthValidationResult = {
  isValid: boolean;
  error?: string;
};

export const validateEmail = (email: string): AuthValidationResult => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'El email es obligatorio.' };
  }
  if (!emailPattern.test(trimmed)) {
    return { isValid: false, error: 'El email no tiene un formato valido.' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): AuthValidationResult => {
  if (!password) {
    return { isValid: false, error: 'La contrasena es obligatoria.' };
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      error: `La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`,
    };
  }
  return { isValid: true };
};

export const validateDisplayName = (displayName: string): AuthValidationResult => {
  const trimmed = displayName.trim();
  if (!trimmed) {
    return { isValid: false, error: 'El nombre es obligatorio.' };
  }
  if (trimmed.length > MAX_DISPLAY_NAME_LENGTH) {
    return {
      isValid: false,
      error: `El nombre no puede superar ${MAX_DISPLAY_NAME_LENGTH} caracteres.`,
    };
  }
  return { isValid: true };
};

export const validateSignInInput = (email: string, password: string): AuthValidationResult => {
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    return emailResult;
  }
  return validatePassword(password);
};

export const validateSignUpInput = (
  email: string,
  password: string,
  displayName: string,
): AuthValidationResult => {
  const emailResult = validateEmail(email);
  if (!emailResult.isValid) {
    return emailResult;
  }
  const passwordResult = validatePassword(password);
  if (!passwordResult.isValid) {
    return passwordResult;
  }
  return validateDisplayName(displayName);
};

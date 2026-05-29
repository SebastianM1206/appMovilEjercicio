import { describe, expect, it } from 'vitest';
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
  validateSignInInput,
  validateSignUpInput,
} from './authValidation';

describe('authValidation', () => {
  it('validates email format', () => {
    expect(validateEmail('runner@example.com').isValid).toBe(true);
    expect(validateEmail('invalid-email').isValid).toBe(false);
  });

  it('validates password length', () => {
    expect(validatePassword('12345678').isValid).toBe(true);
    expect(validatePassword('short').isValid).toBe(false);
  });

  it('validates display name length', () => {
    expect(validateDisplayName('Test Runner').isValid).toBe(true);
    expect(validateDisplayName('').isValid).toBe(false);
  });

  it('validates sign in input', () => {
    expect(validateSignInInput('runner@example.com', 'TestPass123').isValid).toBe(true);
  });

  it('validates sign up input', () => {
    expect(
      validateSignUpInput('test@example.com', 'TestPass123', 'Test Runner').isValid,
    ).toBe(true);
  });
});

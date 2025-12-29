import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';

describe('dozen Library Tests', () => {
  let dom;
  let window;
  let document;
  let d;

  beforeEach(async () => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <form id="testForm">
            <input type="text" name="name" aria-describedby="name-error" value="Test">
            <span id="name-error" class="error-message"></span>
            
            <input type="email" name="email" aria-describedby="email-error" value="test@example.com">
            <span id="email-error" class="error-message"></span>
            
            <input type="number" name="age" aria-describedby="age-error" value="25">
            <span id="age-error" class="error-message"></span>
            
            <input type="password" name="password" aria-describedby="password-error" value="Password123">
            <span id="password-error" class="error-message"></span>
            
            <input type="password" name="confirmPassword" aria-describedby="confirmPassword-error" value="Password123">
            <span id="confirmPassword-error" class="error-message"></span>
            
            <input type="checkbox" name="agree" aria-describedby="agree-error" checked>
            <span id="agree-error" class="error-message"></span>
            
            <input type="tel" name="phone" aria-describedby="phone-error" value="1(234)5678900">
            <span id="phone-error" class="error-message"></span>
          </form>
        </body>
      </html>
    `);

    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;
    global.HTMLElement = window.HTMLElement;
    global.HTMLInputElement = window.HTMLInputElement;
    global.HTMLFormElement = window.HTMLFormElement;
    global.HTMLSpanElement = window.HTMLSpanElement;
    global.HTMLTextAreaElement = window.HTMLTextAreaElement;
    global.HTMLParagraphElement = window.HTMLParagraphElement;

    const { d: dozen } = await import('../realization/dozen.ts');
    d = dozen;
    
    const { rules } = await import('../realization/chains.ts');
    rules.clear();
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
  });

  describe('Happy Path Tests', () => {
    test('should create form validator successfully', () => {
      const form = document.querySelector('#testForm');
      
      const validator = d.form(form);
      
      expect(validator).toBeDefined();
      expect(typeof validator.field).toBe('function');
      expect(typeof validator.validate).toBe('function');
    });

    test('should validate all fields successfully with correct data', async () => {
      const form = document.querySelector('#testForm');
      const validator = d.form(form);
      
      validator
        .field('name')
        .string()
        .min(2)
        .max(50)
        .required();
      
      validator
        .field('email')
        .string()
        .required()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      
      validator
        .field('age')
        .number()
        .min(18)
        .max(120)
        .required();
      
      validator
        .field('password')
        .string()
        .min(8)
        .pattern(/[A-Z]/)
        .pattern(/[0-9]/)
        .required();
      
      validator
        .field('confirmPassword')
        .string()
        .required();
      
      validator
        .field('agree')
        .boolean()
        .required();
      
      validator
        .field('phone')
        .string()
        .required()
        .pattern(/^\d\(\d{3}\)\d{7}$/);
      
      const rules = validator.getRawValues ? (window.rules = new Map()) : window.rules;
      if (rules) {
        rules.set('confirmPassword', [(value) => {
          const password = document.querySelector('[name="password"]').value;
          return value === password ? null : 'Passwords do not match';
        }]);
      }
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.values).toBeDefined();
      expect(result.values.name).toBe('Test');
      expect(result.values.email).toBe('test@example.com');
    });

    test('should get raw values correctly', () => {
      const form = document.querySelector('#testForm');
      const validator = d.form(form);
      
      const values = validator.getRawValues();
      
      expect(values.name).toBe('Test');
      expect(values.email).toBe('test@example.com');
      expect(values.age).toBe('25');
      expect(values.password).toBe('Password123');
      expect(values.agree).toBe(true);
    });

    test('should validate single field successfully', async () => {
      const form = document.querySelector('#testForm');
      const validator = d.form(form);
      
      validator
        .field('name')
        .string()
        .required()
        .min(2);
      
      const result = await validator.validateField('name');
      
      expect(result.isOk).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('"Evil" Tests - Edge Cases and Error Scenarios', () => {
    test('should fail when required field is empty', async () => {
      const form = document.querySelector('#testForm');
      const nameInput = form.querySelector('[name="name"]');
      nameInput.value = '';
      
      const validator = d.form(form);
      
      validator
        .field('name')
        .string()
        .required('Name is required');
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].fieldsName).toBe('name');
      expect(result.errors[0].message).toBe('Name is required');
    });

    test('should fail when string is too short', async () => {
      const form = document.querySelector('#testForm');
      const nameInput = form.querySelector('[name="name"]');
      nameInput.value = 'A';
      
      const validator = d.form(form);
      
      validator
        .field('name')
        .string()
        .min(2, 'Name must be at least 2 characters');
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Name must be at least 2 characters');
    });

    test('should fail when string is too long', async () => {
      const form = document.querySelector('#testForm');
      const nameInput = form.querySelector('[name="name"]');
      nameInput.value = 'A'.repeat(51);
      
      const validator = d.form(form);
      
      validator
        .field('name')
        .string()
        .max(50, 'Name must be at most 50 characters');
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Name must be at most 50 characters');
    });

    test('should fail when pattern does not match', async () => {
      const form = document.querySelector('#testForm');
      const emailInput = form.querySelector('[name="email"]');
      emailInput.value = 'invalid-email';
      
      const validator = d.form(form);
      
      validator
        .field('email')
        .string()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format');
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Invalid email format');
    });

    test('should fail when number is less than minimum', async () => {
      const form = document.querySelector('#testForm');
      const ageInput = form.querySelector('[name="age"]');
      ageInput.value = '17';
      
      const validator = d.form(form);
      
      validator
        .field('age')
        .number()
        .min(18, 'Age must be at least 18');
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Age must be at least 18');
    });

    test('should fail when number is greater than maximum', async () => {
      const form = document.querySelector('#testForm');
      const ageInput = form.querySelector('[name="age"]');
      ageInput.value = '121';
      
      const validator = d.form(form);
      
      validator
        .field('age')
        .number()
        .max(120, 'Age must be at most 120');
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Age must be at most 120');
    });

    test('should fail when number is not integer', async () => {
      const form = document.querySelector('#testForm');
      const ageInput = form.querySelector('[name="age"]');
      ageInput.value = '25.5';
      
      const validator = d.form(form);
      
      validator
        .field('age')
        .number()
        .integer('Age must be an integer');
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Age must be an integer');
    });

    test('should fail when checkbox is not checked', async () => {
      const form = document.querySelector('#testForm');
      const agreeInput = form.querySelector('[name="agree"]');
      agreeInput.checked = false;
      
      const validator = d.form(form);
      
      validator
        .field('agree')
        .boolean()
        .required('You must agree to the terms');
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].fieldsName).toBe('agree');
      expect(result.errors[0].message).toBe('You must agree to the terms');
    });

    test('should handle multiple validation errors', async () => {
      const form = document.querySelector('#testForm');
      const nameInput = form.querySelector('[name="name"]');
      const emailInput = form.querySelector('[name="email"]');
      const ageInput = form.querySelector('[name="age"]');
      
      nameInput.value = '';
      emailInput.value = 'invalid';
      ageInput.value = '17';
      
      const validator = d.form(form);
      
      validator
        .field('name')
        .string()
        .required('Name required');
      
      validator
        .field('email')
        .string()
        .required('Email required')
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email');
      
      validator
        .field('age')
        .number()
        .required('Age required')
        .min(18, 'Too young');
      
      const result = await validator.validate();
      
      expect(result.isOk).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
      
      const errorMessages = result.errors.map(e => e.message);
      expect(errorMessages).toContain('Name required');
      expect(errorMessages).toContain('Invalid email');
      expect(errorMessages).toContain('Too young');
    });
  });

  describe('Branch Coverage Tests', () => {
    test('should handle non-existent field validation', async () => {
      const form = document.querySelector('#testForm');
      const validator = d.form(form);
      
      validator
        .field('nonExistentField')
        .string()
        .required();
      
      const result = await validator.validateField('nonExistentField');

      expect(result).toBeDefined();
    });

    test('should handle checkbox with parse() method', async () => {
      const form = document.querySelector('#testForm');
      const agreeInput = form.querySelector('[name="agree"]');
      
      agreeInput.value = 'true';
      agreeInput.type = 'hidden';
      
      const validator = d.form(form);
      
      validator
        .field('agree')
        .boolean()
        .parse('Must be boolean');
      
      const values = validator.getRawValues();
      const result = await validator.validateField('agree');
      
      expect(values.agree).toBe('true');
      expect(result.isOk).toBe(true);
    });

    test('should handle form without aria-describedby elements', () => {
      const formWithMissingAria = document.createElement('form');
      formWithMissingAria.innerHTML = `
        <input type="text" name="test1">
        <input type="text" name="test2" aria-describedby="non-existent">
      `;
      
      const validator = d.form(formWithMissingAria);
      
      expect(validator).toBeDefined();
    });

    test('should test clearErrors functionality', () => {
      const form = document.querySelector('#testForm');
      const validator = d.form(form);
      
      validator.setError('testField', 'Test error');
      
      validator.clearError('testField');
      
      const errors = validator.getErrorsAsArray();
      expect(errors.find(e => e.fieldsName === 'testField')).toBeUndefined();
    });

    test('should test clearErrors for all fields', () => {
      const form = document.querySelector('#testForm');
      const validator = d.form(form);
      
      validator.setError('field1', 'Error 1');
      validator.setError('field2', 'Error 2');
      validator.setError('field3', 'Error 3');
      
      validator.clearErrors();
      
      const errors = validator.getErrorsAsArray();
      expect(errors).toHaveLength(0);
    });
  });
});
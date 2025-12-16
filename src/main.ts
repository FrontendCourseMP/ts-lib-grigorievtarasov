import { d } from './realization/dozen';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#testForm') as HTMLFormElement;
    
    const validator = d.form(form);

    validator
        .field('name')
        .string()
        .min(2, 'Имя должно содержать минимум 2 символа')
        .max(50, 'Имя должно содержать максимум 50 символов')
        .required('Имя обязательно для заполнения')
        .trim();
    
    validator
        .field('email')
        .string()
        .pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Введите корректный email адрес')
        .required('Email обязателен для заполнения');
    
    validator
        .field('age')
        .number()
        .min(18, 'Возраст должен быть не менее 18 лет')
        .max(120, 'Введите корректный возраст')
        .integer('Возраст должен быть целым числом')
        .required('Возраст обязателен для заполнения');
    
    validator
        .field('password')
        .string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .pattern(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
        .pattern(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
        .required('Пароль обязателен для заполнения');
    
    validator
        .field('confirmPassword')
        .string()
        .required('Подтверждение пароля обязательно');

    validator
        .field('agree')
        .boolean()
        .required('Требуется согласиться с условиями');
    
    validator
        .field('phone')
        .string()
        .pattern(/^\d\(\d{3}\)\d{7}$/, 'Введите корректный номер телефона')
        .required('Номер телефона обязателен для заполнения');
    
    const rules = (window as any).rules;
    if (rules) {
        const confirmPasswordRule = (value: any) => {
            const password = (document.querySelector('#password') as HTMLInputElement)?.value;
            if (value !== password) {
                return 'Пароли не совпадают';
            }
            return null;
        };
        
        if (!rules.has('confirmPassword')) {
            rules.set('confirmPassword', []);
        }
        rules.get('confirmPassword')!.push(confirmPasswordRule);
    }
    
    const agreeRule = () => {
        const agreeCheckbox = document.querySelector('#agree') as HTMLInputElement;
        if (!agreeCheckbox?.checked) {
            return 'Необходимо согласиться с условиями';
        }
        return null;
    };
    
    if (rules) {
        if (!rules.has('agree')) {
            rules.set('agree', []);
        }
        rules.get('agree')!.push(agreeRule);
    }
    
    function displayErrors(errors: Array<{fieldsName: string, message: string}>) {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        
        errors.forEach(error => {
            const errorElement = document.querySelector(`[aria-describedby="${error.fieldsName}-error"]`)?.nextElementSibling as HTMLElement;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = error.message;
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const result = await validator.validate();
        displayErrors(result.errors);
        
        if (result.isOk) {
            alert('Форма успешно отправлена!');
        }
    });
    
    form.querySelectorAll('input').forEach(input => {
        input.addEventListener('blur', async () => {
            const fieldName = input.name;
            if (fieldName) {
                const result = await validator.validate();
                displayErrors(result.errors);
            }
        });
        
        input.addEventListener('input', () => {
            const errorElement = input.nextElementSibling as HTMLElement;
            if (errorElement && errorElement.classList.contains('error-message')) {
                errorElement.textContent = '';
            }
        });
    });
});
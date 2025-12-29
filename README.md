# Документация по вашему решению

Работают:

- Тарасов Фёдор
- Жмеренчук Александр

# Название библиотеки - **dozen**

## Требования

- Форма должна находиться в DOM
- Среда выполнения: браузер
- Каждый input обязан иметь:
  - аттрибут id или name
  - атрибут aria-describedby, указывающий на id элемента для вывода ошибок

## Пример использования

### Пример формы в HTML:
```html
<form id="myForm" novalidate>
  <input type="text" name="username" aria-describedby="username-error">
  <span id="username-error" class="error"></span>
  
  <input type="email" name="email" aria-describedby="email-error">
  <span id="email-error" class="error"></span>
</form>
```
### Пример валидации:
```ts
import { d } from './dozen';

const form = document.querySelector('#myForm');
const validator = d.form(form);

// Настройка правил валидации
validator
.field('username')
.string()
.required('Имя пользователя обязательно')
.min(3, 'Минимум 3 символа')
.max(20, 'Максимум 20 символов');

validator
.field('email')
.string()
.required('Email обязателен')
.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Неверный формат email');

// Получение результата валидации
const result = validator.validate();
```
## API

### `d.form(form: HTMLFormElement): FormValidator`

Создает валидатор для указанной формы.

### Методы валидатора:

`validate(): Promise<ValidationResult>` - валидирует все поля формы. Возвращает объект с результатами.

```typescript
interface ValidationResult {
  isOk: boolean;              // true если ошибок нет
  errors: ValidatorError[];   // массив ошибок
  values?: Record<string, PossibleTypes>; // значения полей
}
```

`validateField(name: string): Promise<ValidationResult>` - валидирует только указанное поле.

`getRawValues(): Record<string, PossibleTypes>` - возвращает значения всех полей формы.

`getErrorsAsArray(): ValidatorError[]` - возвращает все ошибки в виде массива.

```typescript
interface ValidatorError {
  fieldsName: string;   // имя поля
  message: string;      // текст ошибки
}
```
`setError(fieldsName: string, message: string): void` - устанавливает ошибку для указанного поля.

`clearError(fieldsName: string): void`- удаляет ошибки для указанного поля.

`clearErrors(): void` - удаляет все ошибки.

### Методы валидации

### String:

 - `.required(message?: string): this` - поле обязательно

 - `.min(length: number, message?: string): this` - минимальная длина

 - `.max(length: number, message?: string): this` - максимальная длина

 - `.pattern(regex: RegExp, message?: string): this` - проверка по регулярному выражению

 - `.trim(): this` - автоматическая обрезка пробелов

### Number:

 - `.required(message?: string): this` - поле обязательно

 - `.min(value: number, message?: string): this` - минимальное значение

 - `.max(value: number, message?: string): this` - максимальное значение

 - `.integer(message?: string): this` - должно быть целым числом

### Array:

 - `.required(message?: string): this` - поле обязательно

 - `.min(length: number, message?: string): this` - минимальное количество элементов

 - `.max(length: number, message?: string): this` - максимальное количество элементов

### Boolean:

 - `.required(message?: string): this` - поле обязательно

 - `.parse(message?: string): this` - разрешает строки "true"/"false"
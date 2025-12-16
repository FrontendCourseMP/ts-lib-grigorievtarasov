import type {FieldBuilder, FormValidator, PossibleTypes, ValidatorError, ValidationResult} from '../types/types.ts'
import { Builder } from './fieldBuilder.ts'
import { rules } from './chains.ts'


function isInputElement(element: Element | null): element is HTMLInputElement {
    return element instanceof HTMLInputElement;
}

type TextElement = HTMLSpanElement | HTMLTextAreaElement | HTMLParagraphElement;

function isTextElement(element: Element | null): element is TextElement {
    return element instanceof HTMLSpanElement ||
        element instanceof HTMLTextAreaElement ||
        element instanceof HTMLParagraphElement;
}

function formElementsFilter<T extends Element>(
    form: HTMLFormElement, guard: (el: Element) => el is T
): T[] {
    const output: T[] = [];

    for (const el of Array.from(form.elements) as Element[]) {
        if (guard(el)) {
            output.push(el);
        }
    }

    return output
} 


export const d = {
    errors: [] as ValidatorError[],
    
    form(form: HTMLFormElement): FormValidator {
        const inputs: HTMLInputElement[] = formElementsFilter(form, isInputElement);
        const descriptors = new Map<HTMLInputElement, TextElement>();

        for (const input of inputs) {
            const descId = input.getAttribute('aria-describedby');

            if (!descId) {
                this.errors.push({
                    fieldsName: input.name || input.id || 'unknown',
                    message: "This input element is missing it's described-by element",
                });
            }
            
            else {
                const desc = form.querySelector(`#${descId}`);
                
                if (!isTextElement(desc)) {
                    this.errors.push({
                        fieldsName: input.name || input.id || 'unknown',
                        message: `Described-by element #${descId} not found or incorrect type`,
                    });
                }

                else {
                    descriptors.set(input, desc);
                }
            }
        }

        const errors: Record<string, string[]> = {};
        const values: Record<string, PossibleTypes> = {};

        const api: FormValidator = {
            field(name: string): FieldBuilder {
                return Builder(name)
            },

            getErrorsAsArray(): ValidatorError[] {
                const arr: ValidatorError[] = [];

                for (const name in errors) {
                    for (const msg of errors[name]) {
                        arr.push({
                            fieldsName: name,
                            message: msg,
                        });
                    }
                }

                return arr
            },

            async validate(): Promise<ValidationResult> {
                this.clearErrors();
                this.getRawValues();

                for (const [field, fns] of rules.entries()) {
                    const value = values[field];

                    for (const func of fns) {
                        const error = func(value);

                        if (error) {
                            this.setError(field, error);
                        }
                    }
                }

                return {
                    isOk: Object.keys(errors).length === 0,
                    errors: this.getErrorsAsArray(),
                    values,
                }
            },

            async validateField(name: string): Promise<ValidationResult> {
                return {
                    isOk: !errors[name]?.length,
                    errors: errors[name]?.map((msg) => ({
                        fieldsName: name,
                        message: msg,
                    })) || [],
                    values,
                }
            },

            getRawValues(): Record<string, PossibleTypes> {
                for (const input of inputs) {
                    if (input.type === 'checkbox') {
                        values[input.name] = (input as HTMLInputElement).checked;
                    } else {
                        values[input.name] = input.value;
                    }
                }

                return values
            },

            setError(fieldsName: string, message: string) {
                if (!errors[fieldsName]) {
                    errors[fieldsName] = [];
                }

                errors[fieldsName].push(message);
            },

            clearError(fieldsName: string) {
                delete errors[fieldsName];
            },

            clearErrors() {
                for (const k in errors) {
                    delete errors[k];
                }
            }
        };

        return api
    },
}
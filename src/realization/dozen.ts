import type {FormValidator, ValidatorError} from '../types/types.ts'


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


const d = {
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
                        message: "Ddescribed-by element not found or incorrect type",
                    });
                }

                else {
                    descriptors.set(input, desc);
                }
            }
        }
    },
    
    errors: [] as ValidatorError[], 
}
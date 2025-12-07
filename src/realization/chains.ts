import type {StringChain, NumberChain, ArrayChain} from "../types/types.ts";


export const rules = new Map<string, Array<(value: any) => string | null | void>>();

export function addRule(field: string, fn: (value: any) => string | null | void) {
    if (!rules.has(field)) {
        rules.set(field, []);
    }

    rules.get(field)!.push(fn);
}

export function stringChain(fieldsName: string): StringChain {
    return {
        required(message = 'Field is missing') {
            addRule(fieldsName, (value) => {
                value ? null : message;
            });

            return this
        },

        min(length: number, message: string = 'String is shorter than it should be') {
            addRule(fieldsName, (value) => {
                typeof value === "string" && value.length < length ? message : null;
            });

            return this
        },
        
        max(length: number, message: string = 'String is longer than it should be') {
            addRule(fieldsName, (value) => {
                typeof value === "string" && value.length < length ? message : null;
            });

            return this
        },

        pattern(regex: RegExp, message: string = 'Regular expression error') {
            addRule(fieldsName, (value) => {
                typeof value === 'string' && !regex.test(value) ? message : null
            });

            return this
        },

        trim() {
            return this
        }
    }
}
    
export function numberChain(fieldsName: string): NumberChain {
    return {
        required(message = 'Field is missing') {
            addRule(fieldsName, (value) => {
                value ? null : message;
            });

            return this
        },

        min(n: number, message: string = 'Number is lower than it should be') {
            addRule(fieldsName, (value) => {
                Number(value) < n ? message : null;
            });

            return this
        },
        
        max(n: number, message: string = 'Number is higher than it should be') {
            addRule(fieldsName, (value) => {
                Number(value) > n ? message : null;
            });

            return this
        },

        integer(message: string = 'Number must be integer') {
            addRule(fieldsName, (value) => {
                Number.isInteger(Number(value)) ? null : message;
            });

            return this
        }
    }
}

export function arrayChain(fieldName: string): ArrayChain {
    return {
        required(message = 'Field is required') {
            addRule(fieldName, (value) =>
                value && value.length ? null : message
            );

            return this;
        },

        min(length: number, message = `Must contain at least ${length} items`) {
            addRule(fieldName, (value) =>
                Array.isArray(value) && value.length < length ? message : null
            );

            return this;
        },

        max(length: number, message = `Must contain at most ${length} items`) {
            addRule(fieldName, (value) =>
                Array.isArray(value) && value.length > length ? message : null
            );

            return this;
        },
    };
}
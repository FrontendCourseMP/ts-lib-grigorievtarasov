import type {StringChain, NumberChain, ArrayChain, BooleanChain} from "../types/types.ts";


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
                return value ? null : message;
            });

            return this
        },

        min(length: number, message: string = 'String is shorter than it should be') {
            addRule(fieldsName, (value) => {
                return typeof value === "string" && value.length < length ? message : null;
            });

            return this
        },
        
        max(length: number, message: string = 'String is longer than it should be') {
            addRule(fieldsName, (value) => {
                return typeof value === "string" && value.length > length ? message : null;
            });

            return this
        },

        pattern(regex: RegExp, message: string = 'Regular expression error') {
            addRule(fieldsName, (value) => {
                return typeof value === 'string' && !regex.test(value) ? message : null
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
                return value ? null : message;
            });

            return this
        },

        min(n: number, message: string = 'Number is lower than it should be') {
            addRule(fieldsName, (value) => {
                return Number(value) < n ? message : null;
            });

            return this
        },
        
        max(n: number, message: string = 'Number is higher than it should be') {
            addRule(fieldsName, (value) => {
                return Number(value) > n ? message : null;
            });

            return this
        },

        integer(message: string = 'Number must be integer') {
            addRule(fieldsName, (value) => {
                return Number.isInteger(Number(value)) ? null : message;
            });

            return this
        }
    }
}

export function arrayChain(fieldName: string): ArrayChain {
    return {
        required(message = 'Field is required') {
            addRule(fieldName, (value) => {
                return value && value.length ? null : message
            });

            return this;
        },

        min(length: number, message = `Must contain at least ${length} items`) {
            addRule(fieldName, (value) => {
                return Array.isArray(value) && value.length < length ? message : null
            });

            return this;
        },

        max(length: number, message = `Must contain at most ${length} items`) {
            addRule(fieldName, (value) => {
                return Array.isArray(value) && value.length > length ? message : null
            });

            return this;
        },
    };
}

export function booleanChain(fieldName: string): BooleanChain {
    return {
        required(message = 'Field is required') {
            addRule(fieldName, (value) => {
                return value ? null : message
            });

            return this;
        },

        parse(message = 'Value must be a boolean') {
            addRule(fieldName, (value) => {
                if (value === 'true' || value === 'false') {
                    return null;
                }

                if (value === true || value === false) {
                    return null;
                }

                return message;
            });
            return this;
        },
    };
}
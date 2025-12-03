import type {StringChain, ValidatorMessage, ValidatorError} from "./types/types.ts";

class StringRealisation implements StringChain {
    length: number;
    constructor(length: number) {
        this.length = length;
    }
    max (length: number, message: ValidatorMessage = 'validationError'): this {
        if (this.length > length) {
            const valError: ValidatorError = {
                fieldsName: '',
                messages: message,
            }


        }
        return this;
    }

    min (length: number, message: ValidatorMessage = 'validationError'): this {
        if (this.length < length) {
            const valError: ValidatorError = {
                fieldsName: '',
                messages: message,
            }

            
        }
        return this;
    }

    pattern (regex: RegExp, message: ValidatorMessage = 'validationError'): this {
        if (this.length < length) {
            const valError: ValidatorError = {
                fieldsName: '',
                messages: message,
            }

            
        }
        return this;
    }
}
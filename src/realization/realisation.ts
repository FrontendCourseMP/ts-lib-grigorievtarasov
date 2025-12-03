import type {StringChain, ValidatorMessage, ValidatorError} from "../types/types.ts";


class StringRealisation implements StringChain {
    data: string
    length: number;

    constructor(data: string) {
        this.data = data;
        this.length = data.length;
    }


    required(message: ValidatorMessage = 'Field is missing') {
        if (!this.data) {
            const valError: ValidatorError = {
                fieldsName: '',
                messages: message,
            }
        }

        return this
    }


    trim() {
        this.data = this.data.trim();

        return this
    }

    max(length: number, message: ValidatorMessage = 'String is longer than it should be'): this {
        if (this.length > length) {
            const valError: ValidatorError = {
                fieldsName: '',
                messages: message,
            }


        }
        return this;
    }

    min(length: number, message: ValidatorMessage = 'String is shorter than it should be'): this {
        if (this.length < length) {
            const valError: ValidatorError = {
                fieldsName: '',
                messages: message,
            }

            
        }
        return this;
    }

    pattern(regex: RegExp, message: ValidatorMessage = 'RegExp error'): this {
        if (!regex.test(this.data)) {
            const valError: ValidatorError = {
                fieldsName: '',
                messages: message,
            }

            
        }
        return this;
    }
}
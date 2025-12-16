export type PossibleTypes = string | number | boolean;


export type ValidatorMessage = string;

export type ValidatorError = {
    fieldsName: string,
    message: ValidatorMessage
}

export type ValidationResult = {
    isOk: boolean,
    errors: ValidatorError[],
    values?: Record<string, PossibleTypes>
}


export interface BaseChain {
    required(message?: ValidatorMessage): this,
}

export interface BooleanChain extends BaseChain {
    parse(message?: string): this
}

export interface StringChain extends BaseChain {
    min(
        length: number,
        message?: ValidatorMessage
    ): this,
    
    max(
        length: number,
        message?: ValidatorMessage
    ): this,
    
    pattern(
        regex: RegExp,
        message?: ValidatorMessage
    ): this,
    
    trim(): this
}

export interface NumberChain extends BaseChain {
    min(
        value: number,
        message?: ValidatorMessage
    ): this,
    
    max(
        value: number,
        message?: ValidatorMessage
    ): this,
    
    integer(
        message?: string
    ): this
}

export interface ArrayChain extends BaseChain {
    min(
        length: number,
        message?: ValidatorMessage
    ): this,
    
    max(
        length: number,
        message?: ValidatorMessage
    ): this
}


export interface FieldBuilder {
    string(): StringChain,
    number(): NumberChain,
    array(): ArrayChain,
    boolean(): BooleanChain
}

export interface FormValidator {
    field(name: string): FieldBuilder,

    getErrorsAsArray(): ValidatorError[],

    validate(): Promise<ValidationResult>,

    validateField(name: string): Promise<ValidationResult>,

    getRawValues(): Record<string, PossibleTypes>,

    setError(
        fieldsName: string, 
        message: string
    ): void,

    clearError(fieldsName: string): void,

    clearErrors(): void
}
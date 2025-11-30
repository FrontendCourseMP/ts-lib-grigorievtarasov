export type ValidatorMessage = string;

export type ValidatorError = {
    fieldsName: string,
    messages: ValidatorMessage
}

export type ValidationResult = {
    isOk: boolean,
    errors: ValidatorError[],
    values?: Record<string, any>
}


export interface BaseChain {
    required(message?: ValidatorMessage): this,

    custom(
        validator: (raw: any) => boolean,
        message?: ValidatorMessage
    ): this,
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
import type { FieldBuilder } from '../types/types'
import { addRule, stringChain, numberChain, arrayChain } from './chains'


export function Builder(fieldsName: string): FieldBuilder {
    return {
        string() {
            addRule(fieldsName, (value: any) => {
                return typeof value === 'string' ? null : 'Must be a string';
            });

            return stringChain(fieldsName)
        },

        number() {
            addRule(fieldsName, (value: any) => {
                return isNaN(Number(value)) ? 'Must be a number' : null;
            });

            return numberChain(fieldsName)
        },

        array() {
            addRule(fieldsName, (value: any) => {
                return Array.isArray(value) ? null : 'Must be an array';
            });

            return arrayChain(fieldsName)
        },
    }
}
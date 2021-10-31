export declare const SETTINGS: {
    DEBUG: boolean;
};
export interface Declaration {
    type: 'declaration';
    property: string;
    value: string;
}
export interface Rule {
    type: 'rule';
    selectors: Array<string>;
    declarations: Array<Declaration | Rule>;
}
export declare function transform(cssp: string): string;

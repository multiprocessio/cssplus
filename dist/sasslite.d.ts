export interface Declaration {
  type: "declaration";
  property: string;
  value: string;
}
export interface Rule {
  type: "rule";
  selectors: Array<string>;
  declarations: Array<Declaration | Rule>;
}
export declare function transform(sass: string): string;

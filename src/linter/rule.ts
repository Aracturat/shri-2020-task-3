import { AstArray, AstEntity, AstIdentifier, AstLiteral, AstObject, AstProperty } from "json-to-ast";

import { Context } from "./context";


export type Checker =
    | ((node: AstObject, parent: AstEntity | null) => void)
    | ((node: AstArray, parent: AstEntity | null) => void)
    | ((node: AstLiteral, parent: AstEntity | null) => void)
    | ((node: AstIdentifier, parent: AstEntity | null) => void)
    | ((node: AstProperty, parent: AstEntity | null) => void)


export interface Rule {
    messages: { [code: string]: string };

    create(context: Context): Record<string, Checker | Checker[]>;
}

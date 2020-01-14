import { AstIdentifier } from "json-to-ast";

import { Context } from "../context";
import { Rule } from "../rule";


export class UppercaseNamesAreForbiddenRule implements Rule {
    messages = {
        'UPPERCASE_NAMES_IS_FORBIDDEN': 'Запрещены названия полей в верхнем регистре'
    };

    create(context: Context) {
        return {
            'Identifier': function (node: AstIdentifier) {
                if (/^[A-Z]+$/.test(node.value)) {
                    context.report({
                        node,
                        code: 'UPPERCASE_NAMES_IS_FORBIDDEN'
                    });
                }
            }
        };
    }
}

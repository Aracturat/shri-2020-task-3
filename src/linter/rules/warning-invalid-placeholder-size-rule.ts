import { AstObject } from "json-to-ast";

import { Context } from "../context";
import { Rule } from "../rule";
import { findByPath } from "../utils";


export class WarningInvalidPlaceholderSizeRule implements Rule {
    messages = {
        'WARNING.INVALID_PLACEHOLDER_SIZE': 'Допустимые размеры для блока placeholder в блоке warning (значение модификатора size): s, m, l'
    };

    create(context: Context) {
        let isInWarningBlock = false;

        return {
            'Bem:warning:Enter': function (node: AstObject) {
                isInWarningBlock = true;
            },
            'Bem:warning:Exit': function (node: AstObject) {
                isInWarningBlock = false;
            },
            'Bem:placeholder': function (node: AstObject) {
                if (isInWarningBlock) {
                    let sizeEntity = findByPath(node, 'mods.size');

                    if (!sizeEntity || sizeEntity.type !== 'Literal' || !sizeEntity.value) {
                        return;
                    }

                    let placeholderSize = sizeEntity.value.toString();

                    if (!['s', 'm', 'l'].includes(placeholderSize)) {
                        context.report({
                            node,
                            code: 'WARNING.INVALID_PLACEHOLDER_SIZE'
                        });
                    }
                }
            }
        };
    }
}

import { AstObject } from "json-to-ast";

import { Context } from "../context";
import { Rule } from "../rule";


export class WarningInvalidButtonPositionRule implements Rule {
    messages = {
        'WARNING.INVALID_BUTTON_POSITION': 'Блок button в блоке warning не может находиться перед блоком placeholder на том же или более глубоком уровне вложенности'
    };

    create(context: Context) {
        let isInWarningBlock = false;
        let button: AstObject | null = null;

        return {
            'Bem:warning:Enter': function (node: AstObject) {
                isInWarningBlock = true;
                button = null;
            },
            'Bem:warning:Exit': function (node: AstObject) {
                isInWarningBlock = false;
                button = null;
            },
            'Bem:button': function (node: AstObject) {
                if (isInWarningBlock) {
                    button = node;
                }
            },
            'Bem:placeholder': function (node: AstObject) {
                if (isInWarningBlock) {
                    if (button) {
                        context.report({
                            node,
                            code: 'WARNING.INVALID_BUTTON_POSITION'
                        });
                    }
                }
            }
        };
    }
}

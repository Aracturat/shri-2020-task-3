import { AstEntity, AstObject } from "json-to-ast";

import { Context } from "../context";
import { Rule } from "../rule";
import { findProperty } from "../utils";


export class BlockNameIsRequiredRule implements Rule {
    messages = {
        'BLOCK_NAME_IS_REQUIRED': 'В каждом объекте должно быть поле block'
    };

    create(context: Context) {
        return {
            'Object': function (node: AstObject, parent: AstEntity | null) {
                // Если есть родитель, то проверяем, что объект не является mods или elemMods.
                if (parent && parent.type === 'Property') {
                    if (parent.key.value === 'mods' || parent.key.value === 'elemMods') {
                        return;
                    }
                }

                // Проверяем наличие поля block.
                const blockProperty = findProperty(node, 'block');

                if (!blockProperty || blockProperty.value.type !== 'Literal' || !blockProperty.value.value) {
                    context.report({
                        node,
                        code: 'BLOCK_NAME_IS_REQUIRED'
                    });
                }
            }
        };
    }
}

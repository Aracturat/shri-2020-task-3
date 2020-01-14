import { AstObject } from "json-to-ast";

import { Context } from "../context";
import { Rule } from "../rule";
import { findBlocks, findByPath, findProperty } from "../utils";


export class WarningTextSizesShouldBeEqualRule implements Rule {
    messages = {
        'WARNING.TEXT_SIZES_SHOULD_BE_EQUAL': 'Тексты в блоке warning должны быть одного размера'
    };

    create(context: Context) {
        return {
            'Bem:warning': function (node: AstObject) {
                // Проверяем, есть ли content.
                const content = findProperty(node, 'content');

                if (!content || content.value.type !== 'Array' || !content.value) {
                    return;
                }

                // Проверяем, есть ли текстовые блоки.
                let textBlocks = findBlocks(content.value, 'text');

                let isValid = true;
                let textSize: string | null = null;

                for (let textBlock of textBlocks) {
                    let sizeEntity = findByPath(textBlock, 'mods.size');

                    if (!sizeEntity || sizeEntity.type !== 'Literal' || !sizeEntity.value) {
                        isValid = false;
                        break;
                    }

                    let textBlockSize = sizeEntity.value.toString();

                    if (textSize) {
                        if (textSize !== textBlockSize) {
                            isValid = false;
                        }
                    } else {
                        textSize = textBlockSize;
                    }
                }

                if (!isValid) {
                    context.report({
                        node: node,
                        code: 'WARNING.TEXT_SIZES_SHOULD_BE_EQUAL'
                    });
                }
            }
        };
    }
}

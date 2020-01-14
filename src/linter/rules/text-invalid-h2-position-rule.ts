import { AstObject } from "json-to-ast";

import { Context } from "../context";
import { Rule } from "../rule";
import { findByPath } from "../utils";


export class TextInvalidH2PositionRule implements Rule {
    messages = {
        'TEXT.INVALID_H2_POSITION': 'Заголовок второго уровня (блок text с модификатором type h2) не может находиться перед заголовком первого уровня на том же или более глубоком уровне вложенности'
    };

    create(context: Context) {
        let h2Blocks = new Array<AstObject>();

        return {
            'Bem:text': function (node: AstObject) {
                let typeEntity = findByPath(node, 'mods.type');
                if (!typeEntity || typeEntity.type !== 'Literal' || !typeEntity.value) {
                    return;
                }

                let type = typeEntity.value.toString();

                if (type === 'h2') {
                    h2Blocks.push(node);
                    return;
                }

                if (type === 'h1') {
                    if (h2Blocks.length > 0) {
                        h2Blocks.forEach(h2Block => {
                            context.report({
                                node: h2Block,
                                code: 'TEXT.INVALID_H2_POSITION'
                            });
                        });

                        h2Blocks.length = 0;
                    }
                }
            }
        };
    }
}

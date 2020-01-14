import { AstObject } from "json-to-ast";

import { Context } from "../context";
import { Rule } from "../rule";
import { findByPath } from "../utils";


export class TextInvalidH3PositionRule implements Rule {
    messages = {
        'TEXT.INVALID_H3_POSITION': 'Заголовок третьего уровня (блок text с модификатором type h3) не может находиться перед заголовком второго уровня на том же или более глубоком уровне вложенности'
    };

    create(context: Context) {
        let h3Blocks = new Array<AstObject>();

        return {
            'Bem:text': function (node: AstObject) {
                let typeEntity = findByPath(node, 'mods.type');
                if (!typeEntity || typeEntity.type !== 'Literal' || !typeEntity.value) {
                    return;
                }

                let type = typeEntity.value.toString();

                if (type === 'h3') {
                    h3Blocks.push(node);
                    return;
                }

                if (type === 'h2') {
                    if (h3Blocks.length > 0) {
                        h3Blocks.forEach(h3Block => {
                            context.report({
                                node: h3Block,
                                code: 'TEXT.INVALID_H3_POSITION'
                            });
                        });

                        h3Blocks.length = 0;
                    }
                }
            }
        };
    }
}

import { AstObject } from "json-to-ast";

import { Context } from "../context";
import { Rule } from "../rule";
import { findByPath } from "../utils";


export class TextSeveralH1Rule implements Rule {
    messages = {
        'TEXT.SEVERAL_H1': 'Заголовок первого уровня (блок text с модификатором type h1) на странице должен быть единственным'
    };

    create(context: Context) {
        let h1Found = false;

        return {
            'Bem:text': function (node: AstObject) {
                // Получаем mods.
                let typeEntity = findByPath(node, 'mods.type');
                if (!typeEntity || typeEntity.type !== 'Literal' || !typeEntity.value) {
                    return;
                }

                let type = typeEntity.value.toString();
                if (type !== 'h1') {
                    return;
                }

                if (h1Found) {
                    context.report({
                        node: node,
                        code: 'TEXT.SEVERAL_H1'
                    });
                } else {
                    h1Found = true;
                }
            }
        };
    }
}

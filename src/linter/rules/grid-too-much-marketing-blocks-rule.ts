import { AstObject } from "json-to-ast";

import { Context } from "../context";
import { Rule } from "../rule";
import { findByPath, findProperty, getBlockName } from "../utils";


export class GridTooMuchMarketingBlocksRule implements Rule {
    messages = {
        'GRID.TOO_MUCH_MARKETING_BLOCKS': 'Маркетинговые блоки должны занимать не больше половины от всех колонок блока grid'
    };

    create(context: Context) {
        const marketingBlocks = ['commercial', 'offer'];

        const gridBlockInfos = new Array<{
            node: AstObject,
            columns: number,
            marketingBlockColumns: number;
        }>();

        return {
            'Bem:grid:Enter': function (node: AstObject) {
                const columnsEntity = findByPath(node, 'mods.m-columns');

                if (!columnsEntity || columnsEntity.type !== 'Literal') {
                    return;
                }

                const columns = columnsEntity.value;
                if (columns) {
                    gridBlockInfos.push({
                        node,
                        columns: +columns,
                        marketingBlockColumns: 0
                    });
                }
            },
            'Bem:grid:Exit': function (node: AstObject) {
                let gridBlockInfo = gridBlockInfos.pop();

                if (!gridBlockInfo) {
                    return;
                }

                if (gridBlockInfo.marketingBlockColumns > gridBlockInfo.columns / 2) {
                    context.report({
                        node: gridBlockInfo.node,
                        code: 'GRID.TOO_MUCH_MARKETING_BLOCKS'
                    });
                }
            },
            'Bem:grid__fraction': function (node: AstObject) {
                // Проверяем, есть ли content
                const content = findProperty(node, 'content');

                if (!content || content.value.type !== 'Array') {
                    return;
                }

                // Проверяем, есть ли внутренние блоки
                if (content.value.children.length === 0) {
                    return;
                }

                // По условию внутри только один блок
                let innerBlock = content.value.children[0];

                // Проверяем, что это обьект
                if (innerBlock.type !== 'Object') {
                    return;
                }

                // Пытаемся получить имя блока
                const innerBlockName = getBlockName(innerBlock);
                if (!innerBlockName) {
                    return;
                }

                // Получаем размер контента
                const colEntity = findByPath(node, 'elemMods.m-col');

                if (!colEntity || colEntity.type !== 'Literal' || !colEntity.value) {
                    return;
                }

                const col = +colEntity.value;

                if (marketingBlocks.includes(innerBlockName.toString())) {
                    gridBlockInfos[gridBlockInfos.length - 1].marketingBlockColumns += col;
                }
            }
        };
    }
}

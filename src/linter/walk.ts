import { AstEntity } from "json-to-ast";


/**
 * Обход дерева в глубину.
 * @param func функция, которая будет вызвана на каждой ноде дважды (первый раз с type = 'Enter', второй с type = 'Exit')
 * @param node текущая узел дерева
 * @param parent опционально, родитель текущего узла дерева
 */
export function walk(
    func: (node: AstEntity, parent: AstEntity | null, type: 'Enter' | 'Exit') => void,
    node: AstEntity,
    parent: AstEntity | null = null
) {
    func(node, parent, 'Enter');

    switch (node.type) {
        case 'Array':
        case 'Object':
            if (node.children && node.children.length > 0) {
                node.children.forEach((item: AstEntity) => {
                    walk(func, item, node);
                });
            }

            break;
        case 'Property':
            walk(func, node.key, node);
            walk(func, node.value, node);

            break;
        case 'Literal':
        case 'Identifier':
            break;
    }

    func(node, parent,'Exit');
}

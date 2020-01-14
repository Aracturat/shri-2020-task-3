import { AstArray, AstEntity, AstObject, AstProperty } from "json-to-ast";


/**
 * Найти свойство объекта с заданным именем.
 * @param object объект
 * @param propertyName имя свойства
 */
export function findProperty(object: AstObject, propertyName: string): AstProperty | undefined {
    if (!object || !object.children) {
        return undefined;
    }

    return object.children.find(e => e.key.value === propertyName);
}

/**
 * Найти значение свойства объекта с заданным именем.
 * @param object объект
 * @param propertyName имя свойства
 */
export function findPropertyValue(object: AstObject, propertyName: string): AstEntity | undefined {
    let property = findProperty(object, propertyName);

    if (!property) {
        return undefined;
    }

    return property.value;
}

/**
 * Получить имя bem блока из объекта.
 * @param object
 */
export function getBlockName(object: AstObject) {
    const block = findProperty(object, 'block');
    if (!block) {
        return undefined;
    }

    if (block.value.type === 'Literal') {
        return block.value.value;
    }
}

/**
 * Найти в массиве все блоки с заданным именем.
 * @param array массив
 * @param blockName имя блока
 */
export function findBlocks(array: AstArray, blockName: string): AstObject[] {
    if (!array) {
        return [];
    }

    return array.children.filter(e => {
        if (e.type === 'Object') {
            return getBlockName(e) === blockName;
        }

        return false;
    }) as AstObject[];
}

/**
 * Найти узел дерева по пути.
 * Путь имеет вид "key1.key2.key3" и поддерживает вложенность любой глубины.
 * @param object объект
 * @param path путь
 */
export function findByPath(object: AstObject, path: string): AstEntity | undefined {
    if (!object || !path) {
        return undefined;
    }

    let keys = path.split(".");

    let result: AstEntity | undefined = object;

    for (let key of keys) {
        if (!result || result.type !== "Object") {
            return undefined;
        }

        result = findPropertyValue(result, key);
    }

    return result;
}

/**
 * Попытаться получить bem информацию из объекта.
 * @param object объект
 * @param parent родительсткий узел
 */
export function tryGetBemInfo(object: AstObject, parent: AstEntity | null = null): { block?: string, elem?: string } {
    if (!object) {
        return {};
    }

    // Если есть родитель, то проверяем, что объект не является mods или elemMods.
    if (parent) {
        if (parent.type === 'Property') {
            if (parent.key.value === 'mods' || parent.key.value === 'elemMods') {
                return {};
            }
        }
    }

    // Проверяем наличие поля block.
    const blockProperty = findProperty(object, 'block');

    if (!blockProperty || blockProperty.value.type !== 'Literal' || !blockProperty.value.value) {
        return {};
    }

    // Проверяем наличие поля elem.
    const elemProperty = findProperty(object, 'elem');

    if (!elemProperty || elemProperty.value.type !== 'Literal' || !elemProperty.value.value) {
        return {
            block: blockProperty.value.value.toString(),
        };
    }

    return {
        block: blockProperty.value.value.toString(),
        elem: elemProperty.value.value.toString()
    };
}

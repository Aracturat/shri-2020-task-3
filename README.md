# Задание 3. Найдите ошибки

В этом репозитории находятся материалы тестового задания «Найдите ошибки» для [16-й Школы разработки интерфейсов](https://yandex.ru/promo/academy/shri) (зима 2020, Москва).

## Инструменты
- VS Code
- VS Code debugger
- console.log
- Документация https://code.visualstudio.com/api/language-extensions/language-server-extension-guide

# Найденные ошибки

## 1. Ошибки компиляции файла server.ts

### Ошибка 1

В данном коде ошибка, textDocumentSync не может быть `always`:

```ts
conn.onInitialize((params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: 'always'
        }
    };
});
```

Смотрим возможные параметры и меняем на наиболее подходящее по смыслу:

```ts
conn.onInitialize((params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full
        }
    };
});
```

### Ошибка 2

В данном коде ошибка, поле loc не существует у `property.key`

```ts
const validateProperty = (
    property: jsonToAst.AstProperty
): LinterProblem<RuleKeys>[] =>
    /^[A-Z]+$/.test(property.key.value)
        ? [
                {
                    key: RuleKeys.UppercaseNamesIsForbidden,
                    loc: property.key.loc
                }
            ]
        : [];
```

Идем в json-to-ast.d.ts, находим AstIdentifier и добавляем loc:

```ts
export interface AstIdentifier {
    type: 'Identifier';
    value: string;
    raw: string;
    loc: AstLocation;
}
```


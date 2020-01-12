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

## 2. Ошибки линтера

Запускаем расширение - ничего не работает при открытии json файла. Идем в настройки, включаем линтер - все еще не работает.

### Включаем линтер по умолчанию

В принципе, это не ошибка, но для удобства дебага влючаем линтер сразу после запуска расширения.

Идем в package.json, находим данную настройку:

```json
"example.enable": {
    "type": "boolean",
    "default": false,
    "description": "Enable/disable example linter."
}
```

Меняем default на true:
```json
"example.enable": {
    "type": "boolean",
    "default": true,
    "description": "Enable/disable example linter."
}
```

### Правим линтер

Так как ничего не работает, то смотрим в Output для Language Server Example.

Находим там кучу стек трейсов вида:
```
For help, see: https://nodejs.org/en/docs/inspector
(node:19212) UnhandledPromiseRejectionWarning: SyntaxError: Unexpected symbol <f> at 1:1
1 | file://shri-2020-task-1/stub/pages/product.json
    ^
    at Object.<anonymous> (\shri-2020-task-3\node_modules\json-to-ast\build.js:5:2)
    at Module._compile (internal/modules/cjs/loader.js:786:30)
    at Object..js (internal/modules/cjs/loader.js:798:10)
    at Module.load (internal/modules/cjs/loader.js:645:32)
    at Function._load (internal/modules/cjs/loader.js:560:12)
    at Module.require (internal/modules/cjs/loader.js:685:19)
    at require (internal/modules/cjs/helpers.js:16:16)
    at Object.<anonymous> (\shri-2020-task-3\out\linter.js:3:19)
(node:19212) UnhandledPromiseRejectionWarning: SyntaxError: Unexpected symbol <f> at 1:1
```

Открываем файл `linter.js` на 3 строке, видим, что это вызов функции `makeLint`. Смотрим, что передается в коде в эту функцию, находим в файле `server.ts` следующее:

```ts
const source = basename(textDocument.uri);
const json = textDocument.uri;
```

Передается путь до файла, вместо его содержимого, правим на следующее:

```ts
const source = basename(textDocument.uri);
const json = textDocument.getText();
```

### Правим линтер 2

Перезапускаем расширение, ошибки в консоли пропали, но все еще не отображаются во вкладке `Problems`. Продолжаем искать проблему. После долгих поисков, находим следующий подозрительный кусок кода:

```ts
const errors: LinterProblem<TProblemKey>[] = [];
const ast: JsonAST = parseJson(json);

if (ast) {
    walk(ast, 
        (property: jsonToAst.AstProperty) => errors.concat(...validateProperty(property)), 
        (obj: jsonToAst.AstObject) => errors.concat(...validateObject(obj)));
}
```

Здесь используется `contat`, который возвращает новый массив, нам же надо добавлять в текущий массив, поэтому меняем на `push`.

```ts
const errors: LinterProblem<TProblemKey>[] = [];
const ast: JsonAST = parseJson(json);

if (ast) {
    walk(ast, 
        (property: jsonToAst.AstProperty) => errors.push(...validateProperty(property)), 
        (obj: jsonToAst.AstObject) => errors.push(...validateObject(obj)));
}
```


### Правим линтер 3
Перезапускаем, линтер начинает успешно показывать ошибки (правда не всегда верно, к примеру есть много ошибок, что нужно поле `block` в объектах `mods` и `elemMods`). 

Идем в настройки, пытаемся менять для каждого правила `Severity`.

Замечаем, что при установке уровня `Error` ставится уровень `Information`. Находим в коде место с ошибкой:

```ts
function GetSeverity(key: RuleKeys): DiagnosticSeverity | undefined {
    if (!conf || !conf.severity) {
        return undefined;
    }

    const severity: Severity = conf.severity[key];

    switch (severity) {
        case Severity.Error:
            return DiagnosticSeverity.Information;

```

Правим кусок со `switch` на 
```ts
switch (severity) {
    case Severity.Error:
        return DiagnosticSeverity.Error;

```

### Правим линтер 4
Замечаем, что если поправить ошибку, то сообщение о ней не исчезает. 
Пролема в этом куске кода, который посылает новый массив ошибок, только если он не пустой.

```ts
if (diagnostics.length) {
    conn.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
```

Меняем данный код на 

```ts
conn.sendDiagnostics({ uri: textDocument.uri, diagnostics });
```

Так как будем подключать свой линтер, то не правим текущую реализацию правил. Считаем, что все ошибки, мешающие работе линтера, исправлены.


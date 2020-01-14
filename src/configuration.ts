import { getLinterRules } from './linter/linter-rules';

export const problemCodeToConfigKeyMapping = getProblemCodeToConfigKeyMapping();

export enum Severity {
    Error = "Error",
    Warning = "Warning",
    Information = "Information",
    Hint = "Hint",
    None = "None"
}

export interface SeverityConfiguration {
    [key: string]: Severity;
}

export interface ExampleConfiguration {

    enable: boolean;

    severity: SeverityConfiguration;
}

// Вспомогательные функции

function toCamelCase(str: string) {
    const [first, ...rest] = str.toLowerCase().split(/[._]/g);

    return [
        first,
        ...rest.map(e => e.substr(0, 1).toUpperCase() + e.substr(1))
    ].join('');
}

function getProblemCodeToConfigKeyMapping() {
    const messages = new Array<string>();

    // Получаем возможные сообщения
    const rules = getLinterRules();
    rules.forEach(rule => messages.push(...Object.keys(rule.messages)));

    // Генерируем маппинг
    const mapping: { [key: string]: string } = {};

    messages.forEach(e => {
        const configName = toCamelCase(e);

        mapping[e] = configName;
    });

    return mapping;
}


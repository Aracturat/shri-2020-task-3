import * as parseJson from "json-to-ast";
import { AstEntity } from "json-to-ast";

import { walk } from "./walk";
import { Problem } from "./problem";
import { WalkContext } from "./context";

import { Rule } from "./rule";
import { RuleRegistry } from "./rule-registry";
import { getLinterRules } from "./linter-rules";


/**
 * Проверить на ошибки json.
 * @param json строка, содержащая json
 */
export function lint(json: string): Array<Problem> {
    const rules = getLinterRules();
    const linter = createLinter(...rules);

    return linter(json);
}

/**
 * Создать линтер с заданными правилами.
 * @param rules правила
 */
export function createLinter(...rules: Rule[]): (json: string) => Array<Problem> {
    const context = new WalkContext();

    const ruleRegistry = new RuleRegistry(context);

    rules.forEach(rule => ruleRegistry.add(rule));

    return function (json: string) {
        let ast: AstEntity | null = null;

        // Может быть невалидный json
        try {
            ast = parseJson(json);
        } catch {

        }

        if (!ast) {
            return [];
        }

        walk(ruleRegistry.applyCheckers.bind(ruleRegistry), ast);

        return context.getProblems(ruleRegistry.getMessages());
    };
}

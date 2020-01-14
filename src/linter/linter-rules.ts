import { Rule } from "./rule";

import {
    BlockNameIsRequiredRule,
    GridTooMuchMarketingBlocksRule,
    TextInvalidH2PositionRule,
    TextInvalidH3PositionRule,
    TextSeveralH1Rule,
    UppercaseNamesAreForbiddenRule,
    WarningInvalidButtonPositionRule,
    WarningInvalidButtonSizeRule,
    WarningInvalidPlaceholderSizeRule,
    WarningTextSizesShouldBeEqualRule
} from "./rules";


/**
 * Получить список всех используемых правил
 */
export function getLinterRules(): Array<Rule> {
    return [
        new WarningTextSizesShouldBeEqualRule(),
        new WarningInvalidButtonSizeRule(),
        new WarningInvalidButtonPositionRule(),
        new WarningInvalidPlaceholderSizeRule(),

        new TextSeveralH1Rule(),
        new TextInvalidH2PositionRule(),
        new TextInvalidH3PositionRule(),

        new GridTooMuchMarketingBlocksRule(),

        new BlockNameIsRequiredRule(),
        new UppercaseNamesAreForbiddenRule()
    ];
}

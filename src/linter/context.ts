import { AstEntity } from "json-to-ast";
import { Problem } from "./problem";


export interface ProblemInfo {
    node: AstEntity,
    code: string
}

/**
 * Контекст.
 * В данный момент только хранит информацию о произошедших ошибках.
 */
export interface Context {
    report(problemInfo: ProblemInfo): void
}

export class WalkContext implements Context {
    private problemInfos = new Array<ProblemInfo>();

    report(problemInfo: ProblemInfo) {
        this.problemInfos.push(problemInfo);
    }

    getProblems(messages: Map<string, string>): Array<Problem> {
        return this.problemInfos
            .map(pi => {
                return {
                    code: pi.code,
                    error: (messages.get(pi.code) || "Неизвестная ошибка"),
                    location: {
                        start: {
                            line: pi.node.loc.start.line,
                            column: pi.node.loc.start.column
                        },
                        end: {
                            line: pi.node.loc.end.line,
                            column: pi.node.loc.end.column
                        }
                    }
                };
            });
    }
}

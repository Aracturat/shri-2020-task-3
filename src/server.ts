import {
    createConnection,
    ProposedFeatures,
    TextDocuments,
    InitializeParams,
    TextDocument,
    Diagnostic,
    DiagnosticSeverity,
    DidChangeConfigurationParams,
    TextDocumentSyncKind
} from 'vscode-languageserver';

import { basename } from 'path';

import { ExampleConfiguration, Severity, problemCodeToConfigKeyMapping } from './configuration';
import { lint } from './linter/linter';
import { Problem } from './linter/problem';


let conn = createConnection(ProposedFeatures.all);
let docs = new TextDocuments();
let conf: ExampleConfiguration | undefined = undefined;

conn.onInitialize((params: InitializeParams) => {
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Full
        }
    };
});

function GetSeverity(errorCode: string): DiagnosticSeverity | undefined {
    if (!conf || !conf.severity) {
        return undefined;
    }

    const configKey = problemCodeToConfigKeyMapping[errorCode];
    if (!configKey) {
        return undefined;
    }

    const severity: Severity = conf.severity[configKey];

    switch (severity) {
        case Severity.Error:
            return DiagnosticSeverity.Error;
        case Severity.Warning:
            return DiagnosticSeverity.Warning;
        case Severity.Information:
            return DiagnosticSeverity.Information;
        case Severity.Hint:
            return DiagnosticSeverity.Hint;
        default:
            return undefined;
    }
}

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
    const source = basename(textDocument.uri);
    const json = textDocument.getText();

    const errors = lint(json);

    const diagnostics = errors.reduce(
        (
            list: Diagnostic[],
            problem: Problem
        ): Diagnostic[] => {
            const severity = GetSeverity(problem.code);

            if (severity) {

                let diagnostic: Diagnostic = {
                    range: {
                        start: { line: problem.location.start.line - 1, character: problem.location.start.column - 1 },
                        end: { line: problem.location.end.line - 1, character: problem.location.end.column - 1 }
                    },
                    severity,
                    message: problem.error,
                    source
                };

                list.push(diagnostic);
            }

            return list;
        },
        []
    );

    conn.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

async function validateAll() {
    for (const document of docs.all()) {
        await validateTextDocument(document);
    }
}

docs.onDidChangeContent(change => {
    validateTextDocument(change.document);
});

conn.onDidChangeConfiguration(({ settings }: DidChangeConfigurationParams) => {
    conf = settings.example;
    validateAll();
});

docs.listen(conn);
conn.listen();

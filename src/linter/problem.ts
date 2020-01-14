export interface Problem {
    code: string;
    error: string;

    location: {
        start: { line: number; column: number; };
        end: { line: number; column: number; };
    };
}

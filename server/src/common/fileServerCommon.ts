
export class FileServerError extends Error {
    code: string = ""
    suplemental?: string = undefined
    constructor(msg: string, code: string, suplemental: string | undefined = undefined) {
        super(msg);
        this.code = code
        this.suplemental = suplemental
    }
}
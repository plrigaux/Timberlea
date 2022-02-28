
export class FileServerError extends Error {
    code: string = ""
    suplemental?: string = undefined
    constructor(msg: string, code: string, suplemental: string | undefined = undefined) {
        super(msg);

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, FileServerError.prototype);
        this.code = code
        this.suplemental = undefined

    }

}
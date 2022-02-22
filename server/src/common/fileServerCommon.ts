
export class FileServerError extends Error {
    code: string = ""
    constructor(msg: string, code: string) {
        super(msg);

        // Set the prototype explicitly.
        //Object.setPrototypeOf(this, FileServerError.prototype);
        this.code = code
    }

}
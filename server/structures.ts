export enum FileType {
    File,
    Directory,
    Other
}

export interface FileInfo {
    name: string;
    type: FileType;
    size?: number;
}
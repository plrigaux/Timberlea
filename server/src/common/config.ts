import path from 'path';
import * as dotenv from "dotenv";

dotenv.config({
    path: path.resolve(__dirname, "common", `${process.env.NODE_ENV}.env`)
});

class Config {
    NODE_ENV = process.env.NODE_ENV || 'development'
    HOST = process.env.HOST || 'localhost'
    PORT : number = (process.env.PORT || 3000) as number
    currentDirectory = __dirname
    serverUrl = `http://${this.HOST}:${this.PORT}`
}

export const config = new Config()
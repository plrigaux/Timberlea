import path from 'path';
import * as dotenv from "dotenv";

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
});

export const config = {
    NODE_ENV : process.env.NODE_ENV || 'development',
    HOST : process.env.HOST || 'localhost',
    PORT : (process.env.PORT || 3000) as number
}
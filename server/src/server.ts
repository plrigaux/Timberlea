import { app } from './app'
import { config } from '../config';

console.log(`NODE_ENV=${config.NODE_ENV}`);

app.listen(config.PORT, config.HOST, () => {
  console.log(`⚡️[server]: Server is running at https://${config.HOST}:${config.PORT}`);
});
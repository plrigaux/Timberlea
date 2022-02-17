import config from 'config'
import { app } from './app'

//import { config } from './common/config';

//console.log(`NODE_ENV=${config.NODE_ENV}`);

const port = config.get<number>('server.port');
const host = config.get<string>('server.host');

app.listen(port, host, () => {
  console.log(`⚡️[server]: Server is running at https://${host}:${port}`);
});
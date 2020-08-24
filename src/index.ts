import '@loadenv'; // Must be the first import

import app from '@server';
import logger from '@shared/Logger';
import { AliDbClient } from './dbs/AliDbClient';

// Start the server
const port = Number(process.env.PORT || 4000);

AliDbClient.init().then(() => {
    logger.info("db connected")
});

app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});
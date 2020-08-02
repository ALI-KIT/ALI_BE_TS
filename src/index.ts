import './LoadEnv'; // Must be the first import

import app from 'src/Server';
import logger from '@shared/Logger';

// Start the server
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});

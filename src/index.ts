import { AppProcessEnvironment } from '@loadenv';

import app from '@server';
import logger from '@shared/Logger';

// Start the server
const port = Number(AppProcessEnvironment.getProcessEnv().PORT || 4000);



app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});
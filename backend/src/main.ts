import logger from 'jet-logger';

import EnvVars from './common/constants/env';
import server from './server';
import Queue from './common/pgBoss';
import { startVerificationWorker } from './worker/verificationWorker';

/******************************************************************************
                                Constants
******************************************************************************/

const SERVER_START_MESSAGE =
  'Express server started on port: ' + EnvVars.Port.toString();

/******************************************************************************
                                  Run
******************************************************************************/

// Start the server
server.listen(EnvVars.Port, async (err) => {
  if (!!err) {
    logger.err(err.message);
    return;
  }

  logger.info(SERVER_START_MESSAGE);

  try {
    await Queue.start();
    await startVerificationWorker();
  } catch (queueError) {
    logger.err(queueError as Error);
  }
});

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

async function startBackend() {
  try {
    await Queue.start();
    await startVerificationWorker();
  } catch (queueError) {
    logger.err(queueError as Error);
  }
}

// Start the server
server.listen(EnvVars.Port, (err) => {
  if (!!err) {
    logger.err(err.message);
    return;
  }

  logger.info(SERVER_START_MESSAGE);
  void startBackend();
});

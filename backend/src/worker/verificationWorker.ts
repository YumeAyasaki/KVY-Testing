import Queue from '@src/common/pgBoss';
import VerificationAttemptRepo from '@src/repos/VerificationAttemptRepo';
import DocumentRepo from '@src/repos/DocumentRepo';
import EnvVars from '@src/common/constants/env';
import logger from 'jet-logger';

const DEFAULT_MIN = 10000; // 10s
const DEFAULT_MAX = 5 * 60 * 1000; // 5min

function chooseOutcome(outcomes: string[]) {
  if (!outcomes || outcomes.length === 0) return 'INCONCLUSIVE';
  return outcomes[Math.floor(Math.random() * outcomes.length)];
}

export async function startVerificationWorker() {
  const rawOutcomes = (EnvVars.VerificationOutcomes as unknown) as string;
  const outcomes = rawOutcomes ? rawOutcomes.split(',').map((s) => s.trim().toUpperCase()) : ['APPROVED', 'REJECTED', 'INCONCLUSIVE'];

  logger.info(`Starting verification worker with outcomes: ${outcomes.join(',')}`);

  await Queue.subscribeVerificationJob(async (job) => {
    const actualJob = Array.isArray(job) ? job[0] : job;
    const payload = actualJob && typeof actualJob === 'object' ? (actualJob.data ?? actualJob) : undefined;
    const documentId = payload?.documentId as string | undefined;
    if (!documentId) {
      const jobDump = (() => {
        try {
          return JSON.stringify(job);
        } catch {
          return String(job);
        }
      })();
      logger.err(`Verification job missing documentId: ${jobDump}`);
      return;
    }

    try {
      const outcomeRaw = chooseOutcome(outcomes);
      const providerStatus = outcomeRaw.toLowerCase();
      let docStatus: 'APPROVED' | 'REJECTED' | 'INCONCLUSIVE' = 'INCONCLUSIVE';
      if (outcomeRaw === 'VERIFIED' || outcomeRaw === 'APPROVED') docStatus = 'APPROVED';
      else if (outcomeRaw === 'DENIED' || outcomeRaw === 'REJECTED') docStatus = 'REJECTED';

      await VerificationAttemptRepo.add({
        documentId,
        providerStatus,
        adminId: null,
        adminDecision: null,
        reason: `Automated provider: ${outcomeRaw}`,
      });
      await DocumentRepo.update(documentId, { status: docStatus as any });
      logger.info(`Processed verification job for document ${documentId}: ${outcomeRaw}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.err(`Verification worker failed for document ${documentId}: ${message}`);
      try {
        await DocumentRepo.update(documentId, { status: 'INCONCLUSIVE' as any });
        logger.info(`Marked document ${documentId} INCONCLUSIVE after verification failure`);
      } catch (updateError) {
        const updateMessage = updateError instanceof Error ? updateError.message : String(updateError);
        logger.err(
          `Failed to mark document ${documentId} INCONCLUSIVE after verification failure: ${updateMessage}`,
        );
      }
    }
  });
}

export default { startVerificationWorker };

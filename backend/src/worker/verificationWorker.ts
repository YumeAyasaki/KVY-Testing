import Queue from '@src/common/pgBoss';
import VerificationAttemptRepo from '@src/repos/VerificationAttemptRepo';
import DocumentRepo from '@src/repos/DocumentRepo';
import EnvVars from '@src/common/constants/env';
import logger from 'jet-logger';
import { DocumentStatus } from '../../generated/prisma/client';

const DEFAULT_MIN = 10000; // 10s
const DEFAULT_MAX = 5 * 60 * 1000; // 5min

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getDocumentId(job: unknown): string | undefined {
  const actualJob: unknown = Array.isArray(job) ? (job as unknown[])[0] : job;
  if (!isRecord(actualJob)) return undefined;
  const payload = isRecord(actualJob.data) ? actualJob.data : actualJob;
  return typeof payload.documentId === 'string' ? payload.documentId : undefined;
}

function chooseOutcome(outcomes: string[]) {
  if (!outcomes || outcomes.length === 0) return 'INCONCLUSIVE';
  return outcomes[Math.floor(Math.random() * outcomes.length)];
}

export async function startVerificationWorker() {
  const rawOutcomes = (EnvVars.VerificationOutcomes as unknown) as string;
  const outcomes = rawOutcomes ? rawOutcomes.split(',').map((s) => s.trim().toUpperCase()) : ['APPROVED', 'REJECTED', 'INCONCLUSIVE'];

  logger.info(`Starting verification worker with outcomes: ${outcomes.join(',')}`);

  await Queue.subscribeVerificationJob(async (job) => {
    const documentId = getDocumentId(job);
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
      let docStatus: DocumentStatus = DocumentStatus.INCONCLUSIVE;
      if (outcomeRaw === 'VERIFIED' || outcomeRaw === 'APPROVED') docStatus = DocumentStatus.APPROVED;
      else if (outcomeRaw === 'DENIED' || outcomeRaw === 'REJECTED') docStatus = DocumentStatus.REJECTED;

      await VerificationAttemptRepo.add({
        documentId,
        providerStatus,
        adminId: null,
        adminDecision: null,
        reason: `Automated provider: ${outcomeRaw}`,
      });
      await DocumentRepo.update(documentId, { status: docStatus });
      logger.info(`Processed verification job for document ${documentId}: ${outcomeRaw}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.err(`Verification worker failed for document ${documentId}: ${message}`);
      try {
        await DocumentRepo.update(documentId, { status: DocumentStatus.INCONCLUSIVE });
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

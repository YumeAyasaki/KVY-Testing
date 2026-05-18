import { PgBoss } from 'pg-boss';

const connectionString = process.env.DATABASE_URL || '';
const boss = new PgBoss({ connectionString });

export async function start() {
  await boss.start();
  await boss.createQueue('document_verification');
}

export async function stop() {
  await boss.stop();
}

export async function publishVerificationJob(documentId: string) {
  const minDelay = Number(process.env.VERIFICATION_MIN_DELAY_MS) || 10000;
  const maxDelay = Number(process.env.VERIFICATION_MAX_DELAY_MS) || 5 * 60 * 1000;
  const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;

  return boss.sendAfter('document_verification', { documentId }, null, delay);
}

export async function subscribeVerificationJob(handler: (job: any) => Promise<void>) {
  await boss.work('document_verification', async (jobs) => {
    if (Array.isArray(jobs)) {
      for (const job of jobs) {
        await handler(job);
      }
    } else {
      await handler(jobs);
    }
  });
}

export default {
  start,
  stop,
  publishVerificationJob,
  subscribeVerificationJob,
};

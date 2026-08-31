import { existsSync, readFileSync, writeFileSync } from "node:fs";

const RATE_LIMIT_CALLS = 5; // balldontlie's free tier is limited to 5 calls per minute
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000;

export type SeasonCheckpoint = {
  season: number;
  cursor: number | undefined;
  totalImported: number;
  completedSeasons: number[];
};

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function loadCheckpoint(path: string, firstSeason: number): SeasonCheckpoint {
  if (existsSync(path)) {
    const raw = JSON.parse(readFileSync(path, "utf-8"));
    return { ...raw, cursor: raw.cursor ?? undefined };
  }
  return { season: firstSeason, cursor: undefined, totalImported: 0, completedSeasons: [] };
}

export function saveCheckpoint(path: string, checkpoint: SeasonCheckpoint) {
  writeFileSync(path, JSON.stringify(checkpoint, null, 2));
}

export async function withRetry<T>(fn: () => PromiseLike<T> | T, describeFailure: string): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Failed: ${describeFailure} (attempt ${attempt}/${MAX_RETRIES}):`, error);
      // a 429 means the account-wide window is exhausted, wait it out
      const isRateLimit = (error as { status?: number } | undefined)?.status === 429;
      if (attempt < MAX_RETRIES) await sleep(isRateLimit ? RATE_LIMIT_WINDOW_MS : RETRY_DELAY_MS);
    }
  }
  throw new Error(`Giving up on ${describeFailure} after ${MAX_RETRIES} attempts - resume from the checkpoint to retry.`);
}

// Pages through a per-season games endpoint, upserting and checkpointing each page.
export async function backfillBySeasonRange(options: {
  checkpointPath: string;
  firstSeason: number;
  lastSeason: number;
  fetchPage: (
    season: number,
    cursor: number | undefined
  ) => Promise<{ rows: Record<string, unknown>[]; nextCursor: number | undefined }>;
  upsertRows: (rows: Record<string, unknown>[]) => PromiseLike<{ error: unknown }>;
}) {
  const { checkpointPath, firstSeason, lastSeason, fetchPage, upsertRows } = options;
  const checkpoint = loadCheckpoint(checkpointPath, firstSeason);
  // steady pacing instead of bursting all 5 calls then sleeping
  const CALL_INTERVAL_MS = RATE_LIMIT_WINDOW_MS / RATE_LIMIT_CALLS;

  for (let season = firstSeason; season <= lastSeason; season++) {
    if (checkpoint.completedSeasons.includes(season)) {
      console.log(`Season ${season} already completed, skipping.`);
      continue;
    }

    let cursor = checkpoint.season === season ? checkpoint.cursor : undefined;
    let totalImported = checkpoint.totalImported;
    // cursor is undefined both before the first fetch and after the last page
    let hasFetchedPage = false;

    while (!hasFetchedPage || cursor !== undefined) {
      await sleep(CALL_INTERVAL_MS);

      const { rows, nextCursor } = await withRetry(
        () => fetchPage(season, cursor),
        `fetching season ${season} cursor ${cursor}`
      );
      hasFetchedPage = true;

      await withRetry(async () => {
        const { error } = await upsertRows(rows);
        if (error) throw error;
      }, `upserting season ${season} cursor ${cursor}`);

      totalImported += rows.length;
      cursor = nextCursor;
      saveCheckpoint(checkpointPath, { season, cursor, totalImported, completedSeasons: checkpoint.completedSeasons });

      console.log(`[${season}] Imported ${totalImported} so far, next cursor: ${cursor}`);
    }

    checkpoint.completedSeasons = [...checkpoint.completedSeasons, season];
    checkpoint.totalImported = totalImported;
    saveCheckpoint(checkpointPath, { season, cursor: undefined, totalImported, completedSeasons: checkpoint.completedSeasons });
    console.log(`Season ${season} done: ${totalImported} total imported so far across this run.`);
  }

  console.log(`All done: seasons ${firstSeason}-${lastSeason} imported.`);
}

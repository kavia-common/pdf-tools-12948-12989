import fs from 'fs/promises';
import path from 'path';
import dayjs from 'dayjs';
import { OUTPUTS_DIR } from '../utils/fsutil.js';

(async () => {
  try {
    const ttlHours = parseInt(process.env.PUBLIC_DOWNLOAD_TTL_HOURS || '24', 10);
    const cutoff = dayjs().subtract(ttlHours * 2, 'hour'); // keep a bit longer
    const files = await fs.readdir(OUTPUTS_DIR);
    let deleted = 0;
    for (const f of files) {
      const p = path.join(OUTPUTS_DIR, f);
      const st = await fs.stat(p);
      if (dayjs(st.mtime) < cutoff) {
        await fs.unlink(p).catch(() => {});
        deleted++;
      }
    }
    // eslint-disable-next-line no-console
    console.log(`Cleanup completed. Deleted: ${deleted}`);
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Cleanup failed', e);
    process.exit(1);
  }
})();

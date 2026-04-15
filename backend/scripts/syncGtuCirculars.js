const dotenv = require('dotenv');
const connectDB = require('../config/database');
const { syncGtuCirculars } = require('../services/gtuSyncService');

dotenv.config();

async function main() {
    await connectDB();

    const summary = await syncGtuCirculars();

    console.log('GTU sync finished.');
    console.log(`Sources checked: ${summary.sourcesChecked}`);
    console.log(`Discovered: ${summary.discovered}`);
    console.log(`Imported: ${summary.imported}`);
    console.log(`Skipped: ${summary.skipped}`);

    if (summary.failedSources.length > 0) {
        console.log('Failed sources:');
        summary.failedSources.forEach(source => {
            console.log(`- ${source.source}: ${source.error}`);
        });
    }

    process.exit(0);
}

main().catch(error => {
    console.error('GTU sync failed:', error);
    process.exit(1);
});

const { createReadStream } = require('node:fs');
const { parseArgs } = require('node:util');
const { pipeline } = require('node:stream/promises');
const csv = require('csv-parser');
const { MongoClient } = require('mongoose').mongo;

async function readImports(files) {
    const enrollmentNumbers = new Set();
    const emails = new Set();
    let rows = 0;
    for (const file of files) {
        let hasIdentifier = false;
        const parser = csv({
            strict: true,
            mapHeaders({ header }) {
                const key = header.trim();
                if (!['enrollmentNumber', 'enrollmentNo', 'email'].includes(key)) return null;
                hasIdentifier = true;
                return key;
            },
        });
        await pipeline(createReadStream(file), parser, async records => {
            for await (const record of records) {
                rows++;
                const enrollment = (record.enrollmentNumber || record.enrollmentNo || '').trim();
                if (enrollment) enrollmentNumbers.add(enrollment);
                if (record.email?.trim()) emails.add(record.email.trim().toLowerCase());
            }
        });
        if (!hasIdentifier) throw new Error('Import is missing an enrollment or email column');
    }
    return { rows, enrollmentNumbers, emails };
}

function classifyFile(record, isResult, cloudName) {
    const value = isResult ? record.pdfUrl : record.fileUrl;
    if (typeof value !== 'string') return 'review';
    if (value.startsWith('/uploads/')) return 'legacyLocal';
    let url;
    try { url = new URL(value); } catch { return 'review'; }
    if (url.origin !== 'https://res.cloudinary.com' || url.search || url.hash) return 'review';
    const match = url.pathname.match(/^\/([^/]+)\/raw\/(upload|authenticated)\/(?:v\d+\/)?(.+)$/);
    if (!match || (cloudName && match[1] !== cloudName)) return 'review';
    if (match[2] === 'upload') return 'publicCloudinary';
    let id;
    try { id = decodeURIComponent(match[3]); } catch { return 'review'; }
    return id === record.cloudinaryPublicId && (!isResult || record.deliveryType === 'authenticated')
        ? 'authenticatedReference' : 'review';
}

async function inspectDatabase(db, imports, cloudName, reportRecord = () => {}) {
    const summary = {};
    if (imports.enrollmentNumbers.size || imports.emails.size) {
        const matched = { active: 0, inactive: 0 };
        const filter = { $or: [
            { enrollmentNumber: { $in: [...imports.enrollmentNumbers] } },
            { email: { $in: [...imports.emails] } },
        ] };
        for await (const student of db.collection('students').find(filter, {
            projection: { isActive: 1 }, collation: { locale: 'en', strength: 2 },
        })) {
            matched[student.isActive ? 'active' : 'inactive']++;
            reportRecord('students', student._id, 'importMatch');
        }
        summary.matchedStudents = matched;
    }
    for (const collection of ['resultpdfs', 'submissions']) {
        const counts = { authenticatedReference: 0, publicCloudinary: 0, legacyLocal: 0, review: 0 };
        const isResult = collection === 'resultpdfs';
        const projection = { [isResult ? 'pdfUrl' : 'fileUrl']: 1, cloudinaryPublicId: 1, deliveryType: 1 };
        for await (const record of db.collection(collection).find({}, { projection })) {
            const category = classifyFile(record, isResult, cloudName);
            counts[category]++;
            if (category !== 'authenticatedReference') reportRecord(collection, record._id, category);
        }
        summary[collection] = counts;
    }
    return summary;
}

async function main() {
    const { values, positionals } = parseArgs({ allowPositionals: true, options: {
        database: { type: 'boolean' }, ids: { type: 'boolean' },
    } });
    if ((!positionals.length && !values.database) || (values.ids && !values.database)) {
        throw new Error('Usage: npm run release:inventory -- [--database] [--ids] [import.csv ...]');
    }
    const imports = await readImports(positionals);
    const report = { files: positionals.length, rows: imports.rows,
        distinctEnrollmentNumbers: imports.enrollmentNumbers.size, distinctEmails: imports.emails.size };
    if (values.database) {
        require('dotenv').config({ quiet: true });
        if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI to the intended database');
        const client = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
        try {
            await client.connect();
            const db = client.db();
            report.databaseName = db.databaseName;
            report.database = await inspectDatabase(db, imports, process.env.CLOUDINARY_CLOUD_NAME,
                values.ids ? (collection, id, category) => console.log(JSON.stringify({ collection, id, category })) : undefined);
        } finally {
            await client.close();
        }
    }
    console.log(JSON.stringify(report, null, 2));
}

if (require.main === module) main().catch(error => {
    // Driver errors can contain connection details. Keep those out of release logs.
    console.error(error.name === 'Error' ? error.message : 'Inventory failed (' + error.name + ')');
    process.exitCode = 1;
});

module.exports = { readImports, inspectDatabase };

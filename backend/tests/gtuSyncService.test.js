const assert = require('node:assert/strict');
const { describe, test } = require('node:test');
const {
    extractAnchorCandidates,
    extractDatedTextCandidates,
    inferCategory,
    isEngineeringRelevant,
    mapCandidateToNotice,
    parseIndianDate,
} = require('../services/gtuSyncService');

describe('gtuSyncService helpers', () => {
    const source = {
        name: 'GTU School of Engineering and Technology Circulars',
        url: 'https://set.gtu.ac.in/circular/',
    };

    test('parseIndianDate parses day-first dates', () => {
        const parsed = parseIndianDate('15-04-2026');
        assert.ok(parsed instanceof Date);
        assert.equal(parsed.toISOString().slice(0, 10), '2026-04-15');
    });

    test('extractAnchorCandidates captures dated engineering notices', () => {
        const html = `
            <table>
                <tr>
                    <td>15-04-2026</td>
                    <td><a href="/files/circular-1.pdf">Applications Invited for 12-Week Internship on Application of Remote Sensing & GIS in Civil Engineering</a></td>
                </tr>
            </table>
        `;

        const candidates = extractAnchorCandidates(html, source);
        assert.equal(candidates.length, 1);
        assert.ok(candidates[0].title.includes('Civil Engineering'));
        assert.equal(candidates[0].sourceUrl, 'https://set.gtu.ac.in/files/circular-1.pdf');
        assert.equal(candidates[0].publishedAt.toISOString().slice(0, 10), '2026-04-15');
    });

    test('extractDatedTextCandidates captures text-only date rows', () => {
        const html = `
            <div>
                12-04-2026 FDP on Next-Gen Digital Forensics & Incident Response Using Artificial Intelligence
            </div>
        `;

        const candidates = extractDatedTextCandidates(html, source);
        assert.equal(candidates.length, 1);
        assert.ok(candidates[0].title.includes('Artificial Intelligence'));
    });

    test('engineering relevance filters out obvious non-engineering items', () => {
        assert.equal(isEngineeringRelevant({
            title: 'MBA Admission Schedule 2026',
            summary: 'MBA admission round details',
            sourceName: 'GTU IEP Updates',
        }), false);

        assert.equal(isEngineeringRelevant({
            title: 'International conference on Frontiers of Engineering in Healthcare Applications',
            summary: 'Conference notice for engineering students',
            sourceName: 'GTU IEP Updates',
        }), true);
    });

    test('mapCandidateToNotice creates GTU notices with category and source data', () => {
        const candidate = {
            title: 'ME Dissertation Examination Schedule Summer 2026',
            summary: 'Official timetable and guidelines.',
            publishedAt: new Date('2026-04-10T00:00:00.000Z'),
            sourceName: source.name,
            sourcePage: source.url,
            sourceUrl: 'https://set.gtu.ac.in/files/schedule.pdf',
            externalId: 'abc123',
        };

        const notice = mapCandidateToNotice(candidate);
        assert.equal(notice.source, 'GTU');
        assert.equal(notice.category, 'Exam');
        assert.equal(notice.attachment, candidate.sourceUrl);
        assert.equal(notice.externalId, 'abc123');
    });

    test('inferCategory classifies imported notices', () => {
        assert.equal(inferCategory('Admission Merit List for BE Program'), 'Admission');
        assert.equal(inferCategory('Workshop on AI and ML'), 'Events');
        assert.equal(inferCategory('Exam schedule for BE Semester'), 'Exam');
    });
});

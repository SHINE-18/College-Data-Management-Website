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
        expect(parsed).toBeInstanceOf(Date);
        expect(parsed.toISOString().slice(0, 10)).toBe('2026-04-15');
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
        expect(candidates).toHaveLength(1);
        expect(candidates[0].title).toContain('Civil Engineering');
        expect(candidates[0].sourceUrl).toBe('https://set.gtu.ac.in/files/circular-1.pdf');
        expect(candidates[0].publishedAt.toISOString().slice(0, 10)).toBe('2026-04-15');
    });

    test('extractDatedTextCandidates captures text-only date rows', () => {
        const html = `
            <div>
                12-04-2026 FDP on Next-Gen Digital Forensics & Incident Response Using Artificial Intelligence
            </div>
        `;

        const candidates = extractDatedTextCandidates(html, source);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].title).toContain('Artificial Intelligence');
    });

    test('engineering relevance filters out obvious non-engineering items', () => {
        expect(isEngineeringRelevant({
            title: 'MBA Admission Schedule 2026',
            summary: 'MBA admission round details',
            sourceName: 'GTU IEP Updates',
        })).toBe(false);

        expect(isEngineeringRelevant({
            title: 'International conference on Frontiers of Engineering in Healthcare Applications',
            summary: 'Conference notice for engineering students',
            sourceName: 'GTU IEP Updates',
        })).toBe(true);
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
        expect(notice.source).toBe('GTU');
        expect(notice.category).toBe('Exam');
        expect(notice.attachment).toBe(candidate.sourceUrl);
        expect(notice.externalId).toBe('abc123');
    });

    test('inferCategory classifies imported notices', () => {
        expect(inferCategory('Admission Merit List for BE Program')).toBe('Admission');
        expect(inferCategory('Workshop on AI and ML')).toBe('Events');
        expect(inferCategory('Exam schedule for BE Semester')).toBe('Exam');
    });
});

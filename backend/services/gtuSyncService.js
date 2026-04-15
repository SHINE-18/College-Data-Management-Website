const crypto = require('crypto');
const Notice = require('../models/Notice');

const GTU_NOTICE_SOURCES = [
    {
        name: 'GTU IEP Circulars',
        url: process.env.GTU_IEP_CIRCULAR_URL || 'https://www.iep.gtu.ac.in/circular',
    },
    {
        name: 'GTU IEP Updates',
        url: process.env.GTU_IEP_HOME_URL || 'https://www.iep.gtu.ac.in/',
    },
    {
        name: 'GTU School of Engineering and Technology Circulars',
        url: process.env.GTU_SET_CIRCULAR_URL || 'https://set.gtu.ac.in/circular/',
    },
];

const ENGINEERING_KEYWORDS = [
    'engineering',
    'b.e',
    'be ',
    'm.e',
    'me ',
    'civil',
    'computer',
    'mechanical',
    'electrical',
    'electronics',
    'communication',
    'instrumentation',
    'information technology',
    'ict',
    'data science',
    'ai',
    'ml',
    'cyber security',
    'iot',
    'vlsi',
    'structural',
    'remote sensing',
    'gis',
    'drone',
];

const NON_ENGINEERING_KEYWORDS = [
    'm.pharm',
    'pharmacy',
    'mba',
    'bba',
    'commerce',
    'law',
];

const NOTICE_HINT_KEYWORDS = [
    'circular',
    'guideline',
    'guidelines',
    'schedule',
    'admission',
    'invitation',
    'announcement',
    'applications invited',
    'merit list',
    'exam',
    'registration',
    'conference',
    'internship',
    'webinar',
    'workshop',
    'fdp',
    'last date',
];

const BLOCKLIST_TITLES = [
    'home',
    'circular',
    'events',
    'alumni',
    'gallery',
    'academics',
    'student corner',
    'placement cell & research',
    'quick links',
    'registration link',
    'click for registration',
    'apply',
];

const ATTACHMENT_EXTENSIONS = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)(?:[?#].*)?$/i;

function decodeHtmlEntities(value = '') {
    return value
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/&apos;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&#(\d+);/g, (_, codePoint) => String.fromCharCode(Number(codePoint)))
        .replace(/&#x([0-9a-f]+);/gi, (_, codePoint) => String.fromCharCode(parseInt(codePoint, 16)));
}

function stripTags(value = '') {
    return value.replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<\/?(?:p|div|li|tr|td|th|section|article|header|footer|h\d|br)[^>]*>/gi, '\n')
        .replace(/<[^>]+>/g, ' ');
}

function normalizeWhitespace(value = '') {
    return decodeHtmlEntities(value)
        .replace(/\u00a0/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .replace(/\s*\n\s*/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function normalizeTitle(value = '') {
    return normalizeWhitespace(value).toLowerCase();
}

function parseIndianDate(value = '') {
    const match = value.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/);
    if (!match) return null;

    const [, dd, mm, yyyy] = match;
    const parsed = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), 12, 0, 0));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeUrl(href, baseUrl) {
    if (!href) return baseUrl;
    try {
        return new URL(href, baseUrl).toString();
    } catch (error) {
        return baseUrl;
    }
}

function isUsefulTitle(title) {
    const normalized = normalizeTitle(title);
    if (!normalized || normalized.length < 12) return false;
    if (BLOCKLIST_TITLES.includes(normalized)) return false;
    if (/^(read more|click here|download)$/i.test(normalized)) return false;
    return true;
}

function escapeRegex(value = '') {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasKeyword(text, keywords) {
    const normalized = normalizeTitle(text);
    return keywords.some(keyword => {
        const pattern = escapeRegex(keyword)
            .replace(/\\ /g, '\\s+')
            .replace(/\\\./g, '\\.?');
        const regex = new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`, 'i');
        return regex.test(normalized);
    });
}

function looksLikeNotice(title, context = '', hasDate = false) {
    if (hasDate) return true;
    return hasKeyword(`${title} ${context}`, NOTICE_HINT_KEYWORDS);
}

function isEngineeringRelevant(candidate) {
    const haystack = `${candidate.title} ${candidate.summary || ''} ${candidate.sourceName || ''}`;
    const hasPositiveSignal = hasKeyword(haystack, ENGINEERING_KEYWORDS);
    const sourceIsEngineeringOnly = /school of engineering|gtu-set/i.test(candidate.sourceName || '');
    const hasNegativeSignal = hasKeyword(haystack, NON_ENGINEERING_KEYWORDS);

    if (hasPositiveSignal) return true;
    if (sourceIsEngineeringOnly && !hasNegativeSignal) return true;
    return false;
}

function inferCategory(title) {
    const normalized = normalizeTitle(title);
    if (/exam|dissertation|schedule|semester|remedial|thesis/.test(normalized)) return 'Exam';
    if (/admission|merit list|application/.test(normalized)) return 'Admission';
    if (/conference|internship|workshop|webinar|fdp|event/.test(normalized)) return 'Events';
    return 'General';
}

function buildExternalId(title, publishedAt) {
    const datePart = publishedAt instanceof Date ? publishedAt.toISOString().slice(0, 10) : 'undated';
    return crypto
        .createHash('sha1')
        .update(`${normalizeTitle(title)}|${datePart}`)
        .digest('hex');
}

function buildNoticeContent(candidate) {
    const contentParts = [];
    const summary = normalizeWhitespace(candidate.summary || '');
    const summaryDateMatches = summary.match(/\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4}\b/g) || [];

    if (
        summary &&
        normalizeTitle(summary) !== normalizeTitle(candidate.title) &&
        summary.length <= 220 &&
        summaryDateMatches.length <= 1
    ) {
        contentParts.push(summary);
    }

    contentParts.push(`Imported automatically from ${candidate.sourceName}. Open the source link for the full GTU circular.`);
    return contentParts.join('\n\n');
}

function htmlToText(html = '') {
    return normalizeWhitespace(stripTags(html));
}

function extractAnchorCandidates(html, source) {
    const anchorRegex = /<a\b[^>]*href=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi;
    const candidates = [];
    let match;

    while ((match = anchorRegex.exec(html)) !== null) {
        const rawTitle = normalizeWhitespace(stripTags(match[3]));
        if (!isUsefulTitle(rawTitle)) continue;

        const contextStart = Math.max(0, match.index - 220);
        const contextEnd = Math.min(html.length, match.index + match[0].length + 220);
        const context = htmlToText(html.slice(contextStart, contextEnd));
        const publishedAt = parseIndianDate(context) || parseIndianDate(rawTitle);
        const sourceUrl = normalizeUrl(match[2], source.url);

        if (!looksLikeNotice(rawTitle, context, Boolean(publishedAt))) {
            continue;
        }

        candidates.push({
            title: rawTitle,
            summary: context,
            publishedAt,
            sourceName: source.name,
            sourcePage: source.url,
            sourceUrl,
        });
    }

    return candidates;
}

function extractDatedTextCandidates(html, source) {
    const text = htmlToText(html);
    const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
    const candidates = [];

    for (const line of lines) {
        const match = line.match(/^(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})\s+(.+)$/);
        if (!match) continue;

        const [, rawDate, rawTitle] = match;
        const title = normalizeWhitespace(rawTitle);
        if (!isUsefulTitle(title)) continue;

        candidates.push({
            title,
            summary: title,
            publishedAt: parseIndianDate(rawDate),
            sourceName: source.name,
            sourcePage: source.url,
            sourceUrl: source.url,
        });
    }

    return candidates;
}

function dedupeCandidates(candidates) {
    const unique = new Map();

    for (const candidate of candidates) {
        const externalId = buildExternalId(candidate.title, candidate.publishedAt);
        if (!unique.has(externalId)) {
            unique.set(externalId, {
                ...candidate,
                externalId,
            });
        }
    }

    return [...unique.values()];
}

async function fetchSourceCandidates(source) {
    const response = await fetch(source.url, {
        headers: {
            'user-agent': 'VGEC GTU Sync Bot/1.0',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed with status ${response.status}`);
    }

    const html = await response.text();
    const candidates = dedupeCandidates([
        ...extractAnchorCandidates(html, source),
        ...extractDatedTextCandidates(html, source),
    ]);

    return candidates
        .filter(isEngineeringRelevant)
        .sort((a, b) => {
            const first = a.publishedAt ? a.publishedAt.getTime() : 0;
            const second = b.publishedAt ? b.publishedAt.getTime() : 0;
            return second - first;
        })
        .slice(0, 30);
}

function mapCandidateToNotice(candidate) {
    const publishedAt = candidate.publishedAt || new Date();
    const preferredUrl = candidate.sourceUrl || candidate.sourcePage;
    const attachment = preferredUrl && ATTACHMENT_EXTENSIONS.test(preferredUrl) ? preferredUrl : null;

    return {
        title: candidate.title,
        content: buildNoticeContent(candidate),
        category: inferCategory(candidate.title),
        department: 'All',
        postedBy: 'GTU Sync Bot',
        source: 'GTU',
        sourceUrl: preferredUrl,
        sourcePage: candidate.sourcePage,
        externalId: candidate.externalId || buildExternalId(candidate.title, candidate.publishedAt),
        publishedAt,
        attachment,
        isActive: true,
    };
}

async function syncGtuCirculars(options = {}) {
    const logger = options.logger || console;
    const sources = options.sources || GTU_NOTICE_SOURCES;
    const dryRun = Boolean(options.dryRun);
    const summary = {
        sourcesChecked: 0,
        discovered: 0,
        imported: 0,
        skipped: 0,
        failedSources: [],
        notices: [],
    };

    for (const source of sources) {
        try {
            const candidates = await fetchSourceCandidates(source);
            summary.sourcesChecked += 1;
            summary.discovered += candidates.length;

            for (const candidate of candidates) {
                const noticeDoc = mapCandidateToNotice(candidate);

                if (dryRun) {
                    summary.imported += 1;
                    summary.notices.push(noticeDoc);
                    continue;
                }

                const result = await Notice.updateOne(
                    { externalId: noticeDoc.externalId },
                    { $setOnInsert: noticeDoc },
                    { upsert: true }
                );

                if (result.upsertedCount > 0) {
                    summary.imported += 1;
                    summary.notices.push(noticeDoc);
                } else {
                    summary.skipped += 1;
                }
            }
        } catch (error) {
            summary.failedSources.push({
                source: source.name,
                url: source.url,
                error: error.message,
            });

            logger.error(`[GTU sync] ${source.name} failed: ${error.message}`);
        }
    }

    return summary;
}

let syncIntervalHandle = null;
let syncInProgress = false;

async function runGtuSyncJob(logger = console) {
    if (syncInProgress) {
        logger.log('[GTU sync] Previous sync is still running, skipping this cycle.');
        return null;
    }

    syncInProgress = true;

    try {
        const summary = await syncGtuCirculars({ logger });
        logger.log(`[GTU sync] Imported ${summary.imported} notices, skipped ${summary.skipped}, checked ${summary.sourcesChecked} sources.`);
        return summary;
    } catch (error) {
        logger.error(`[GTU sync] Job failed: ${error.message}`);
        return null;
    } finally {
        syncInProgress = false;
    }
}

function startGtuSyncScheduler(logger = console) {
    const enabled = process.env.GTU_SYNC_ENABLED !== 'false';
    if (!enabled) return null;

    const intervalMinutes = Number(process.env.GTU_SYNC_INTERVAL_MINUTES || 60);
    const shouldRunOnStartup = process.env.GTU_SYNC_ON_STARTUP !== 'false';

    if (shouldRunOnStartup) {
        runGtuSyncJob(logger);
    }

    syncIntervalHandle = setInterval(() => {
        runGtuSyncJob(logger);
    }, Math.max(intervalMinutes, 15) * 60 * 1000);

    logger.log(`[GTU sync] Scheduler started. Next sync every ${Math.max(intervalMinutes, 15)} minutes.`);
    return syncIntervalHandle;
}

module.exports = {
    GTU_NOTICE_SOURCES,
    buildExternalId,
    decodeHtmlEntities,
    extractAnchorCandidates,
    extractDatedTextCandidates,
    fetchSourceCandidates,
    htmlToText,
    inferCategory,
    isEngineeringRelevant,
    mapCandidateToNotice,
    parseIndianDate,
    runGtuSyncJob,
    startGtuSyncScheduler,
    syncGtuCirculars,
};

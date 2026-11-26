const assert = require('node:assert/strict');
const { parseArgs } = require('node:util');

function origin(value) {
    const url = new URL(value);
    const local = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if ((!local && url.protocol !== 'https:') || url.origin !== value.replace(/\/$/, '')) {
        throw new Error('Supply a frontend and API origin using HTTPS or local loopback HTTP');
    }
    return url.origin;
}

async function check(origin, path, status, type) {
    const target = new URL(path, origin);
    assert.equal(target.origin, origin, 'Check paths must stay on the specified host');
    const response = await fetch(target, { redirect: 'error', signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, status, target.pathname + ' returned HTTP ' + response.status);
    assert.match(response.headers.get('content-type') || '', type, target.pathname + ' has the wrong content type');
    return response;
}

async function verifyDeployment(frontend, api, options = {}) {
    for (const host of new Set([api, frontend])) {
        const health = await check(host, '/api/health', 200, /application\/json/i);
        assert.match(health.headers.get('cache-control') || '', /\bno-store\b/i);
        assert.equal((await health.json()).status, 'ready', 'Database is unavailable');
        const missing = await check(host, '/api/release-check-missing', 404, /application\/json/i);
        await missing.json();
        console.log('API readiness, cache policy and JSON 404 passed for ' + host);
    }
    const page = await check(frontend, '/', 200, /text\/html/i);
    const html = await page.text();
    const entry = html.match(/<script\b[^>]*\bsrc="(\/assets\/[^"]+\.js)"[^>]*>/i)?.[1];
    assert.ok(entry, 'Built JavaScript entry was missing from the home page');
    const bundle = await check(frontend, entry, 200, /javascript/i);
    await bundle.body.cancel();
    const deepLink = await check(frontend, '/notices', 200, /text\/html/i);
    assert.ok((await deepLink.text()).includes(entry), 'Deep link did not serve the same build');
    if (options.legacy) {
        assert.ok(/^\/uploads\/[^?#]+\.pdf$/i.test(options.legacy), 'Supply a public legacy PDF path under /uploads/');
        const doc = await check(frontend, options.legacy, 200, /application\/pdf/i);
        await doc.body.cancel();
    }
    if (options.sitemap) {
        const sitemap = await check(frontend, '/sitemap.xml', 200, /xml/i);
        const urls = [...(await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
        assert.ok(urls.some(url => url.pathname === '/notices'), 'Notices missing from sitemap');
        assert.ok(urls.every(url => url.origin === origin(options.sitemap)), 'Unexpected sitemap origin');
    }
    const checked = ['frontend bundle', 'notices deep link'];
    if (options.legacy) checked.push('legacy PDF');
    if (options.sitemap) checked.push('sitemap');
    console.log('Passed ' + checked.join(', '));
}

if (require.main === module) {
    const { values, positionals } = parseArgs({ allowPositionals: true, options: {
        legacy: { type: 'string' }, sitemap: { type: 'string' },
    } });
    Promise.resolve().then(() => {
        if (positionals.length !== 2) throw new Error('Supply the frontend origin followed by the API origin');
        return verifyDeployment(origin(positionals[0]), origin(positionals[1]), values);
    }).catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    });
}

module.exports = { verifyDeployment };

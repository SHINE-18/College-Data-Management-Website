# VGEC portal release plan

Promote a staging build after completing the credential response, private-file migration and provider checks below. The deployment consists of a Netlify frontend, a long-running Express API, MongoDB, Cloudinary and an email provider.

## Release status on November 26, 2026

| Check | Outcome |
| --- | --- |
| Historical student imports | The retained import contains 136 enrollment numbers. The former template contains three more. Across the two files, 139 distinct enrollments and 139 email addresses were recorded with populated password fields. Both files appear in Git history. Matching accounts in the institution's database, including any affected staff accounts, remains pending. |
| Database recovery rehearsal | MongoDB Database Tools 100.20.1 dumped a synthetic database. After stopping the source, the archive was restored into a second local MongoDB instance. The restored API authenticated the student and retrieved their attendance. The unique enrollment index was present. A provider-managed backup and restore test remains pending. |
| Split frontend/API rehearsal | A Netlify-configured build passed through a local proxy against a separate production-mode API. Both addresses returned uncached readiness JSON and a JSON 404. The frontend served the notices deep link, JavaScript bundle, public legacy PDF and correctly addressed sitemap. |
| Hosting | The staging API blueprint is prepared. Hosted staging has not been provisioned. Live Cloudinary access, email delivery, credential rotation and production promotion remain pending. |

## First hosted staging deployment

1. Create a separate Netlify project for staging and obtain its HTTPS origin. Link it to the revision containing these changes. The first successful frontend build needs the API origin from step 3.
2. Create a staging MongoDB database, Cloudinary environment and test mailbox. Use synthetic academic records. For email, choose an SMTP sandbox that supports STARTTLS on port 2525 and captures messages addressed to test accounts. Render's free web services restrict outbound ports 25, 465 and 587. [Render free-service limits](https://render.com/docs/free)
3. Create a Render Blueprint using [render.yaml](render.yaml) from the same revision. Enter the Netlify origin as `FRONTEND_URL`, the staging database URI including its database name, the staging Cloudinary credentials, the SMTP sandbox hostname and credentials, and the sandbox sender address as `EMAIL_FROM`. The blueprint generates separate JWT secrets, uses the free staging instance, disables scheduled GTU sync, and configures the readiness probe. Record the resulting API origin. [Render Blueprint reference](https://render.com/docs/blueprint-spec)
4. Set `API_ORIGIN` in the staging Netlify project's build environment and deploy the frontend. Run the following command from the repository root, replacing both example origins. The optional sitemap check applies when the build publishes a canonical sitemap.

```sh
npm run release:verify --prefix backend -- https://staging.example.edu https://api-staging.example.edu --legacy /uploads/notices/notice-1775643166877-84626219.pdf --sitemap https://staging.example.edu
```

## Inventory accounts and legacy files

From `backend/`, use the following commands on a trusted administrative machine. The first reads enrollment and email columns from the local CSVs. The second uses `MONGODB_URI` to match students and classify result and submission references. Supply a read-only database identity, specify the database name in the URI, and set `CLOUDINARY_CLOUD_NAME` to identify the intended Cloudinary environment.

```sh
npm run release:inventory -- private/students_import.csv private/student_template.csv
npm run release:inventory -- --database private/students_import.csv private/student_template.csv
```

The default report contains counts. Add `--ids` to the database command when an authorized operator needs individual MongoDB record IDs for remediation. Use `--database` alone for a file-only inventory. A matched student identifies a candidate for credential rotation. Review staff provisioning records separately. An authenticated file reference still needs a provider access check. Resolve every public, local or unclassified file before signing off on migration.

## Vercel staging deployment

Import the `production-staging` branch as a **Services** project with the repository root `./`. The root `vercel.json` routes `/api/*` and legacy `/uploads/*` to Express and serves React at the same origin. Set `FRONTEND_URL` to the stable staging HTTPS origin so password-reset links point to staging. Leave `VITE_API_URL` unset. Use the server-side environment settings for MongoDB, Cloudinary, email, and two distinct JWT secrets listed below. Use separate staging services and data.

Verify `/api/health`, `/notices`, a legacy PDF, and login on the Vercel deployment. The first API request establishes the MongoDB connection. Automatic GTU sync is disabled on Vercel until it has a scheduled job. Keep uploads below the Vercel request limit for staging. Large uploads will need direct-to-Cloudinary delivery before production. [Vercel Services](https://vercel.com/kb/guide/vercel-services) · [Upload limits](https://vercel.com/docs/errors/function_payload_too_large)

## Improvement priorities

| When | Work | Acceptance |
| --- | --- | --- |
| Before launch | Protect accounts from historical imports and shared faculty/HOD passwords. The working tree removes populated imports and debug exports. New faculty set their own passwords by email. | Identify affected accounts, reset credentials, rotate both JWT secrets and review access logs. Restrict retained copies. Coordinate removal of sensitive data from Git history, forks and build artifacts with the repository owner. |
| Before launch | Protect existing result PDFs and student submissions. New files use authenticated Cloudinary delivery. New result links expire after 15 minutes. | Inventory legacy public assets, migrate sensitive files, update their database records and invalidate the original public URLs. Test authorized and signed-out access using synthetic files. |
| Before launch | Exercise the deployment with four staging accounts. | The verification steps below pass against the same revision and provider configuration intended for production. |
| At launch | Monitor API readiness, latency, error rates and database capacity. Enable database backups. | An operator receives a test alert, restores a backup into an isolated database and records the working frontend and API release IDs. |
| After launch | Measure campus-network page loads, import times and GTU sync duration. | Establish a baseline for mobile LCP and API errors. Before adding API replicas, share rate-limit counters across instances and run the scheduler in a single process. |

## Configure the hosts

The local release check ran on Node 24.22.3. Both clean installs and the Netlify-configured production build succeeded. All 20 backend tests passed against disposable MongoDB instances, including a duplicate CSV import, login by the imported student and the release inventory. Edge exercised the home page, notices, all four role dashboards, page reloads and staff token renewal. The production API returned HTTP 503 after its test database stopped. Both npm audits reported zero known vulnerabilities on November 26, 2026. Email delivery and Cloudinary uploads used test doubles in the integration suite and still require staging checks.

| Service | Deployment settings |
| --- | --- |
| API | Use `backend` as the service root, Node.js 24, `npm ci --omit=dev`, and `npm start`. Set `NODE_ENV=production`. The host supplies `PORT`, which defaults to 5000. Use `/api/health` as its readiness probe. |
| MongoDB | Set `MONGODB_URI` for this environment. Give staging and production separate databases and restrict each API identity to its own database. |
| Authentication | Generate independent random values for `JWT_SECRET` and `JWT_REFRESH_SECRET`. Each must have at least 32 characters. Run `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` once per secret and store the values in the API host's secret settings. |
| Browser origins | Set `FRONTEND_URL` to the canonical HTTPS frontend origin. Reset emails link to this origin. `PRODUCTION_URL` accepts a comma-separated list of additional exact HTTPS origins. |
| Uploads and email | Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_USER` and `EMAIL_PASS` on the API. `EMAIL_SERVICE` defaults to Gmail. Verify delivery of the supported document formats in the Cloudinary account. |
| Netlify | Use the repository's `netlify.toml`. Set `API_ORIGIN` to the HTTPS API origin with no path. The build writes proxy rules for `/api/*` and `/uploads/*` ahead of the SPA fallback. Netlify supplies `URL` for the sitemap. Set `SITE_URL` to override it with the canonical custom domain. Use a separate backend for previews with test data. |
| Existing direct API deployments | The existing `VITE_API_URL=https://api.example.edu/api` setting is supported. With `API_ORIGIN` supplied, the Netlify build uses the same-origin proxy. Rebuild after changing either value. |
| GTU sync | Set `GTU_SYNC_ENABLED=false` on staging to suppress scheduled external jobs. Manual sync requires a super-admin session. Setting `SYNC_SECRET_TOKEN` additionally requires a server-side client to send `X-Sync-Token`. Leave it unset for the admin dashboard button. |

The API trusts one proxy hop for client IP rate limiting. Confirm the API host's trusted proxy path and verify independent client limits before launch. Netlify proxy requests have a 26-second timeout. Measure bulk imports and manual sync on staging. Use the supported direct API configuration for longer requests and verify cookie behavior with the intended frontend and API domains. [Netlify proxy documentation](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/)

During the legacy-file migration, record the authenticated Cloudinary public ID in `cloudinaryPublicId`. For result PDFs, also set `deliveryType` to `authenticated` and update `pdfUrl`. For submissions, update `fileUrl`. Verify retrieval using staging copies before retiring the original assets.

## Verify and promote

1. From the project root, run `npm ci --prefix Frontend`, `npm ci --prefix backend`, `npm test --prefix backend` and `npm run build --prefix Frontend`. The tests start a temporary MongoDB instance and download its binary on first use. Run `npm audit` in both packages. The CI workflow repeats the build and backend tests on Linux.
2. Check `/api/health` through both hosts. Expect uncached JSON and HTTP 200 with MongoDB connected. An unknown API path should return JSON with HTTP 404. Refresh `/notices` directly. Check the campus images, legacy uploads and sitemap host.
3. Sign in with student, faculty, HOD and super-admin staging accounts. Reload each dashboard, switch tabs, sign out and try to reopen a protected route. Verify a staff token refresh and a full password-reset email flow.
4. Import a synthetic CSV with a duplicate and verify row-level feedback, student login and department-scoped attendance. Upload a public notice and a private result. Check delivery after an API restart and expiry of the private link.
5. Promote the same Git revision on both hosts. Recheck API health, login and a download. If a check fails, restore the previous compatible API and Netlify releases while retaining credential rotations and private-file protections. Treat database restoration as a separate recovery decision for confirmed data loss.

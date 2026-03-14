# Production Checklist

## Must finish before launch

- Replace placeholder domain values in `public/robots.txt` and `public/sitemap.xml` with the real production domain.
- Add a real favicon and social sharing image, then wire them into `index.html`.
- Seed real users/faculty data and verify each role flow end to end against the live database.
- Add rate limiting, security headers, and request logging on the backend.
- Move uploaded files to persistent cloud/object storage if the app will be deployed on ephemeral hosts.
- Add automated tests for auth, faculty management, leaves, notices, events, and timetables.

## Still using placeholder/demo behavior

- `src/pages/admin/SuperAdminDashboard.jsx`
- `src/pages/admin/SiteSettings.jsx`
- `src/pages/faculty/WorkloadSheet.jsx`
- `src/pages/hod/Reports.jsx`
- `src/pages/hod/TimetableBuilder.jsx`

## Recommended hardening

- Switch auth from `localStorage` to secure HTTP-only cookies if you want stronger XSS resistance.
- Add a backend env validation step so the server fails fast when required secrets are missing.
- Optimize large homepage images and split large frontend bundles.
- Add CI checks for frontend build and backend lint/test runs.

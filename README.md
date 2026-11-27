# SP Eats

SP Eats is a full-stack campus food discovery web application originally developed as part of my Year 2 CI/CD group assignment at Singapore Polytechnic, where I am pursuing a Diploma in Information Technology.

The application helps students explore campus food courts, browse stalls and menus, share reviews and find meals based on their preferences.

This repository showcases **my individual development branch from the academic group project**, together with improvements made after the module. I revisited my work to resolve application issues, verify its functionality and strengthen my understanding of full-stack development.

## Features

- Browse and search food courts, stalls and menus.
- Explore an interactive campus food map.
- Read, submit and filter food reviews.
- View ratings based on customer reviews.
- Get personalised meal suggestions through a step-by-step food preference quiz.
- Save dishes locally in the browser.
- Manage reviews through an admin page protected by a server-side access key.

## My contributions

| Area | Contributions |
| --- | --- |
| Food discovery | Stall and menu browsing, search and stall detail pages |
| Campus map | Interactive campus food map |
| Food Review Hub | Review submission, display, filtering and ratings |
| Admin review management | Review management interface and supporting backend functionality |
| Meal preference quiz | Quiz interface, recommendation API and matching logic |
| Saved meals | Browser-based saved dish interactions |
| Testing | Automated tests and code quality checks |

## Improvements after the assignment

- Resolved application stability and configuration issues.
- Made database setup safer and easier to repeat.
- Protected review moderation with a server-side access key.
- Preserved dietary requirements in meal recommendations.
- Improved the homepage layout for smaller screens.
- Verified application links and image paths.
- Added and maintained automated checks for core features.
- Fixed Playwright compatibility in GitHub Actions.
- Prepared configuration for future online deployment.

## Technologies used

| Category | Technologies |
| --- | --- |
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js, REST APIs |
| Database | PostgreSQL, SQL |
| Testing | Jest, Supertest, Playwright |
| Code quality | ESLint, Prettier |
| Version control and CI/CD | Git, GitHub, GitHub Actions |

## Application structure

The application separates frontend pages, API routes, controllers and database models. The frontend communicates with the Express backend through APIs, and PostgreSQL stores the application data.

The sample dataset includes 6 food courts, 18 stalls and 72 menu items.

## Testing

The latest reported local recovery test run passed:

| Test type | Tests passed |
| --- | ---: |
| Unit | 209 |
| Database integration | 221 |
| Browser end-to-end | 16 |
| **Total** | **446** |

The application also uses linting, formatting checks, dependency auditing and automated GitHub Actions checks.

## Getting started

### Requirements

- Node.js 24 (the deployment configuration uses 24.10.0).
- PostgreSQL.
- Two separate, empty PostgreSQL databases for development and testing.

### Local setup on Windows

Open PowerShell in the repository folder and install the dependencies:

```powershell
npm.cmd ci
Copy-Item .env.example .env.dev
Copy-Item .env.example .env.test
```

Configure each environment file with its own PostgreSQL connection URL in `DATABASE_URL` and the exact corresponding database name in `SP_EATS_RESET_DATABASE`. Use port 3000 for development and 3001 for testing. If review moderation is needed, generate a separate random `ADMIN_ACCESS_TOKEN` of at least 32 characters.

Keep both environment files private and never commit credentials.

Then initialise the development database and start the application:

```powershell
npm.cmd run db:setup
npm.cmd start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000). Leave the terminal running while using the app, and press Ctrl+C to stop it.

The setup command creates tables and sample data only in an empty database. It stops if the database already contains tables.

### Run the tests

Install the Chromium browser once and run the test suite:

```powershell
npx.cmd playwright install chromium
npm.cmd test
```

The test suite uses the separate test database and resets test data. Never configure the test environment to use a database containing data you need to retain.

## Hosting

The application is prepared for a Render web service and a Neon PostgreSQL database. Online deployment is pending.

For initial hosted database setup, copy `.env.example` to `.env.hosted`, set `DATABASE_URL` to the Neon connection URL and set `SP_EATS_RESET_DATABASE` to the exact name of the new, empty hosted database.

```powershell
npm.cmd run db:setup:hosted
```

This creates tables and sample data only in an empty database. Never run `npm.cmd run migration:reset` against a hosted database. Keep `.env.hosted` and all credentials private.

Render configuration:

| Setting | Value |
| --- | --- |
| Build command | `npm ci` |
| Start command | `npm run start:prod` |
| Health check | `/healthz` |
| Region | Singapore |

Set `DATABASE_URL` and a new `ADMIN_ACCESS_TOKEN` securely in Render's environment settings. The application accepts the port supplied by Render.

Free hosting can sleep when idle and may have usage limits or charges. Refer to [Render's free plan details](https://render.com/docs/free) and [Neon's plan details](https://neon.com/docs/introduction/plans) before deploying.

## Current status

- Local application: working and tested.
- Automated CI checks: passing at the latest application fix.
- Online deployment: pending.
- Screenshots and live demo: to be added after sharing permissions are confirmed and the hosted application is tested.

## What I learned

Working on SP Eats helped me understand how frontend interfaces, backend APIs and relational databases work together. It also gave me practical experience with automated testing, Git collaboration and debugging. Revisiting the application after the assignment helped me better understand integration issues and the importance of maintaining working software.

## Academic acknowledgement

SP Eats originated as a collaborative academic group project at Singapore Polytechnic. This repository is based on my individual development branch and includes shared components from the original group project.

The preserved Git history credits Thuta Zaw, ShinnThant-1087 and GitHub Classroom. Credit for shared work belongs to the respective contributors; this repository does not represent sole authorship of the original group project.

## Notes

- Stall information, prices, opening hours, ratings and dietary details are sample data and may not reflect current campus information. Check with stall staff about ingredients and preparation.
- Saved dishes remain in the browser where they were saved.
- The application does not have student accounts.
- This is an educational application, not an official Singapore Polytechnic food service.

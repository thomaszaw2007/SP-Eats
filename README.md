# SP Eats

SP Eats is a Singapore Polytechnic Year 2 group project. It helps students find food stalls and dishes on campus. I revisited my development branch to restore the app, check that it works, and make a few improvements.

## Links

- Source repository: [SP-Eats on GitHub](https://github.com/thomaszaw2007/SP-Eats) (upload pending).
- Live demo: not deployed yet.

## Features

- Browse food stalls and menus.
- Search for stalls and dishes.
- Explore the campus food map.
- Read and write food reviews.
- Save dishes in your browser.
- Get meal suggestions from the food quiz.
- Manage reviews from the admin page with an admin key.

## What I worked on

My branch includes work on stall and menu browsing, search, the campus map, reviews, the food quiz, saved meals, and automated tests. The original commit history is kept with its contributor names.

The history credits Thuta Zaw, ShinnThant-1087, and GitHub Classroom. This was group work, so the project should not be described as work by one person alone.

## Improvements made later

- Made database setup safer and easier to repeat.
- Protected the review admin tools with a server-side key.
- Kept dietary requirements in meal recommendations.
- Improved the homepage for smaller screens.
- Added automated checks for the main app features.

## Technologies

Node.js, Express, PostgreSQL, HTML, CSS, JavaScript, Jest, Supertest, and Playwright.

## Run the app on Windows

You need Node.js 24 or newer. The project includes a local PostgreSQL setup.

Open PowerShell in the project folder and run:

```powershell
npm.cmd ci
node .sp-eats-local/setup.cjs
npm.cmd run db:setup
npm.cmd start
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000) in your browser. Leave the terminal open while you use the app. Press `Ctrl+C` to stop it.

The setup creates `.env.dev` and `.env.test` files with local database settings. Keep these files private; Git ignores them.

`npm.cmd run db:setup` creates the tables and sample data in an empty database. It stops if the database already has tables. The test command uses a separate database and clears its test data.

## Run the tests

Open another PowerShell terminal in the project folder and run:

```powershell
npm.cmd test
```

This runs the unit, database, and browser tests. The tests use a separate database and reset it when they run. Do not point the test settings at a database with data you need to keep.

The browser tests need Chromium. Install it once with:

```powershell
npx.cmd playwright install chromium
```

## Hosting setup

The app is prepared for a Render web service and a Neon PostgreSQL database. It has not been deployed yet.

For the first database setup, copy `.env.example` to `.env.hosted`, put the Neon connection URL in `DATABASE_URL`, and set `SP_EATS_RESET_DATABASE` to the database name in that URL. Then run:

```powershell
npm.cmd run db:setup:hosted
```

This adds the tables and sample data only when the database is empty. It stops if tables already exist. Never run `npm.cmd run migration:reset` on the hosted database. Keep `.env.hosted`, the Neon URL, and the admin key private. Set `DATABASE_URL` and a new admin key in Render's settings; don't add them to this repository.

The Render service uses `npm run start:prod`, accepts Render's port, and checks `/healthz`. The free Render service sleeps after 15 minutes without traffic and takes about a minute to wake. Render may charge for outbound traffic above its included monthly amount, so check usage and do not select paid services. See [Render's free plan details](https://render.com/docs/free).

Neon Free includes 100 compute hours and 1 GB of database storage per project, and it scales to zero when idle. See [Neon's current plan details](https://neon.com/docs/introduction/plans). These limits are suitable for a small demo, not an always-on service.

## Screenshots and online demo

Screenshots and a live link will be added after the project is cleared for sharing and an online version is tested.

## Notes

The stalls, prices, hours, ratings, and dietary details are sample data. They may not match current campus information. Check with stall staff about ingredients and preparation.

Saved dishes stay in the browser where they were saved. The app does not have student accounts.

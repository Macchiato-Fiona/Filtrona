# FLC 2027 · Filtrona Leadership Conference app

Mobile web app for the Filtrona Leadership Conference, Shanghai, 19–21 January 2027 (arrivals Monday 18 January).
Static HTML/CSS/JS: no build step, no frameworks, no server. Hosts on GitHub Pages.

## Publish on GitHub Pages

1. Create a repository (e.g. `flc-2027`) and upload **everything in this folder**, keeping the folder structure. Include the hidden `.nojekyll` file.
2. In the repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`. Save.
3. After a minute the app is live at `https://<your-username>.github.io/flc-2027/`. Put that link in the QR code.
4. On a phone, "Add to Home Screen" installs it like an app, with offline access.

## Preview on a laptop

`preview.html` shows the app inside a phone frame, with controls to switch device (iPhone 17 Pro Max, iPhone 16 Pro Max, iPhone 7 Plus, Galaxy A35, Galaxy A34, and Pixel 8 as a spare Android check), jump to any screen, sign in as any account, and set the preview clock (countdown, Day 1 morning, Gala evening, after the event).

- **On the live site:** open `https://<your-username>.github.io/flc-2027/preview.html`.
- **While editing files on your laptop:** the page must be served, not double-clicked. Either:
  - VS Code: install the **Live Server** extension, right-click `preview.html` → **Open with Live Server**; or
  - Terminal in this folder: `python -m http.server 8000`, then open `http://localhost:8000/preview.html`.

  With "Refresh automatically when I save a file" ticked, the phone reloads a second after you save `data/content.js`, `css/app.css` or any other app file.

The preview page isn't linked from the app and isn't cached for offline use.

## Sign-in accounts

Edit `config/users.js`:

```js
{ name: "Manfei Qi", password: "123133", greeting: "Manfei", initials: "MQ" },
{ name: "Admin",     password: "FILTRONA.", greeting: "Admin", initials: "A", role: "admin" }
```

- `name` is what the person types (not case-sensitive).
- `role: "admin"` opens the Admin page. The admin password also works without the final dot.
- Anyone can tap **Continue as guest** and see everything except the Admin page.

The site is static, so this file is public. The passwords personalise the app; they do not protect anything. What protects publishing is the GitHub token (see below), which lives only on the admin's phone.

## Admin page (no coding needed)

Sign in as **Admin**. The Admin page has four tabs.

- **Notices** — write a message, choose Update / Important / Urgent, choose how long it shows, optionally link a session, then tap **Send to everyone**. It appears as a banner at the top of every screen on every open phone, and as a phone alert for people who tapped "Alert me".
- **Agenda** — tap a session to change time, length, room, title or presenters, or mark it cancelled; or add a new session. Changes stay as a draft until you tap **Publish**. Attendees see an "Updated · was 10:10" tag on changed sessions.
- **Attendees** — copy the columns *Name, Job title, Company, Region* from Excel and paste them in. Preview, then **Replace list** or **Add to list**. You can also remove people from the current list.
- **Setup** — connect GitHub once (below), plus copy/download backups of the data files.

### Connect GitHub once (5 minutes)

1. On github.com: profile picture → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. Name it "FLC admin" and set it to expire after the conference.
3. **Repository access → Only select repositories** → choose this app's repository.
4. **Repository permissions → Contents → Read and write**.
5. Generate, copy, and paste it into **Admin → Setup → Access token**, then tap **Save and test**.

The token is stored only on that phone. Don't put it in any file. If the phone is lost, delete the token on GitHub.

Without a token, admin changes stay on that phone only, which is useful for rehearsing.

### How fast updates arrive

- Publishing writes `data/live.json` or `data/attendees.json` in the repository. GitHub Pages updates in about a minute.
- Open phones check every 60 seconds (`pollSeconds` in `config/users.js`), so most people see a notice within about 2 minutes.
- Phone alerts work while the app is open or in the background. Nothing can reach a phone where the app is fully closed, so keep urgent messages on your usual chat group as well.

## Edit booklet content

All booklet content lives in `data/content.js`: welcome letter, China and Shanghai facts, hotel, places, routes, venues, the four-day agenda, speakers and emergency numbers. Agenda times are Shanghai time (UTC+8), 24-hour `"HH:MM"`, with durations in minutes.

Images are in `assets/img/`. To swap one, replace the file with the same name.

## Rehearse the live view

The home screen shows a countdown before the event, **Happening now / Next** during it, and a thank-you after. To preview the live state, set in `config/users.js`:

```js
previewNow: "2027-01-19T10:20:00+08:00"
```

Set it back to `null` before going live.

## After editing files by hand

Open `sw.js` and bump `VERSION` (e.g. `flc-2027-v2`) so phones that already opened the app fetch the new files. Changes made from the Admin page don't need this.

## Using it in mainland China

- Fonts are self-hosted and there are no Google services, so nothing is blocked by the firewall.
- `github.io` can load slowly or intermittently on mainland networks. Ask attendees to open the link once before travelling; the app is then cached for offline use. Notices need a connection to arrive.
- Map buttons open Apple Maps and Amap (高德), which both work in China.

## Content notes

- Dates moved from January 2026 to the same calendar dates in 2027. The weekdays shift: Day 0 Mon 18, Day 1 Tue 19, Day 2 Wed 20, Day 3 Thu 21.
- Session titles still carry the booklet's years ("2025: Year in Review", "2026 Budget", "Winning 2026", "Global Macro Economics Forecast 2026–2030"). Update them in `data/content.js` or from Admin → Agenda once the 2027 programme is set.
- Booklet fixes: Day 1 lunch "12:25am" → 12:25; Day 2 Q&A "12:15am" → 12:15; "Departure to Airport" has no time in the booklet and shows as "After lunch".
- The starter attendee list is built from names in the booklet agenda. Replace it from Admin → Attendees.

## Structure

```
index.html              app shell
css/app.css             design system and all styles
js/app.js               screens, routing, sign-in, notices, live status
js/admin.js             Admin page (notices, agenda edits, attendees, GitHub publishing)
data/content.js         booklet content
data/live.json          notices and agenda edits (written by Admin)
data/attendees.json     attendee list (written by Admin)
config/users.js         accounts and settings
assets/img/             booklet photography and Filtrona logo (SVG)
assets/fonts/           Barlow and Barlow Condensed (self-hosted)
assets/icons/           home-screen icons
manifest.webmanifest    install metadata
sw.js                   offline cache
```

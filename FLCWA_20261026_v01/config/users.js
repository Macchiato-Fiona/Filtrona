/* ------------------------------------------------------------------
   FLC 2027 — access
   ------------------------------------------------------------------
   Attendees don't need an account: they type their name
   ("First name Last name") and go straight in. The name is only used
   to greet them and to keep their "My agenda" on their phone.

   The admin account is the only one with a password. Typing the admin
   name on the welcome screen shows the password field.
   - name:      what the admin types as their name (not case-sensitive)
   - password:  the admin password (the final dot is optional when typing)

   NOTE: this site is static (GitHub Pages). Anyone can open this file in
   a browser, so the admin password only hides the Admin screen from
   casual users. Publishing changes from the Admin screen also needs a
   GitHub access token, saved only on the admin's own phone. That token
   is the real lock.
------------------------------------------------------------------- */
window.FLC_USERS = [
  { name: "ADMIN", password: "FILTRONA.", greeting: "Admin", initials: "A", role: "admin" }
];

/* ------------------------------------------------------------------
   App settings
   ------------------------------------------------------------------
   previewNow:   null = real time. To rehearse the live "Now & Next" view,
                 set an event-time timestamp, e.g. "2027-01-19T10:20:00+08:00".
   pollSeconds:  how often open phones check for new notices and agenda edits.
   github:       where the Admin page publishes. Leave owner/repo empty to
                 auto-detect from the github.io address.
------------------------------------------------------------------- */
window.FLC_SETTINGS = {
  previewNow: null,
  showOnboarding: true,
  pollSeconds: 60,
  github: { owner: "", repo: "", branch: "main" }
};

/* ------------------------------------------------------------------
   FLC 2027 — sign-in accounts
   ------------------------------------------------------------------
   Edit this list to add, remove or change people.
   - name:      what the person types to sign in (not case-sensitive)
   - password:  what they type as the password
   - greeting:  how the app greets them ("Good morning, Manfei")
   - initials:  shown in the round avatar, top right
   - role:      "admin" opens the Admin page (agenda edits, notices, attendees)

   NOTE: this site is static (GitHub Pages). Anyone can open this file in
   a browser, so these passwords personalise the app; they are not security.
   Publishing changes from the Admin page also needs a GitHub access token,
   which is stored only on the admin's own phone. That token is the real lock.
------------------------------------------------------------------- */
window.FLC_USERS = [
  { name: "Manfei Qi",   password: "123133",    greeting: "Manfei",    initials: "MQ" },
  { name: "Dalvinder",   password: "234234",    greeting: "Dalvinder", initials: "DJ"  },
  { name: "Yi Yi Thia",  password: "345345",    greeting: "Yi Yi",     initials: "YT" },
  { name: "Admin",       password: "FILTRONA.", greeting: "Admin",     initials: "A", role: "admin" }
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

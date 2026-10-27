/* =====================================================================
   FLC 2027 — app logic (static site, no libraries)
   Reads window.FLC_DATA (data/content.js), window.FLC_USERS and
   window.FLC_SETTINGS (config/users.js). Live notices, agenda edits and
   the attendee list come from data/live.json and data/attendees.json,
   which the Admin page publishes. Hash routes: #/home, #/agenda/d1 …
   ===================================================================== */
(function () {
  'use strict';

  var D = window.FLC_DATA;
  var USERS = window.FLC_USERS || [];
  var SET = window.FLC_SETTINGS || {};
  var INLINE = window.FLC_INLINE || {};
  var EV = D.event;

  /* Preview clock override for preview.html (window.name) or a link (?now=…).
     "real" forces the real clock; empty keeps the setting in config/users.js. */
  try {
    var qNow = new URLSearchParams(location.search).get('now');
    var wNow = /(?:^|;)flcnow=([^;]*)/.exec(window.name || '');
    var pick = qNow || (wNow && wNow[1]);
    if (pick) SET.previewNow = pick === 'real' ? null : decodeURIComponent(pick);
  } catch (e) {}

  /* ---------- helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function initials(n) { return String(n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w[0]; }).join('').toUpperCase(); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };

  /* ---------- icons (24px, stroked) ---------- */
  var P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h5v-6h4v6h5V9.5"/>',
    calendar: '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6.5 6.5 0 0 1 3.5 6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.6v.1"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    chev: '<path d="m9 5 7 7-7 7"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    star: '<path d="m12 3.2 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    phone: '<path d="M5 3.5h3.5l1.8 4.6-2.4 1.5a11 11 0 0 0 6.5 6.5l1.5-2.4 4.6 1.8V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2.5"/><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
    map: '<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14M15 6v14"/>',
    car: '<path d="M5 16.5V12l2-5h10l2 5v4.5"/><path d="M3.5 12h17v4.5h-17z"/><circle cx="7.5" cy="16.5" r="1.8"/><circle cx="16.5" cy="16.5" r="1.8"/>',
    shirt: '<path d="M8.5 3.5 4 6l1.8 4 2.2-1V21h8V9l2.2 1L20 6l-4.5-2.5a3.5 3.5 0 0 1-7 0z"/>',
    cup: '<path d="M4 8.5h13v5A5.5 5.5 0 0 1 11.5 19h-2A5.5 5.5 0 0 1 4 13.5z"/><path d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 2.5v3M12 2.5v3"/>',
    bus: '<rect x="4" y="3.5" width="16" height="14" rx="3"/><path d="M4 11h16M8 21v-3.5M16 21v-3.5"/>',
    hotel: '<path d="M4 21V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5V21"/><path d="M2.5 21h19M9.5 21v-4h5v4M8 7.5h2M14 7.5h2M8 11.5h2M14 11.5h2"/>',
    door: '<path d="M5 21V4.5A1.5 1.5 0 0 1 6.5 3h11A1.5 1.5 0 0 1 19 4.5V21"/><path d="M3 21h18M15 12v.1"/>',
    alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.1"/>',
    zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8M10.5 8v5M8 10.5h5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    logout: '<path d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12H15"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.5 5.6 3.5 9s-1 6.3-3.5 9c-2.5-2.7-3.5-5.6-3.5-9S9.5 5.7 12 3z"/>',
    train: '<rect x="5.5" y="3" width="13" height="14" rx="3.5"/><path d="M5.5 10.5h13M9 21l1.5-4M15 21l-1.5-4"/>',
    bell: '<path d="M6 10a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 15 6 10z"/><path d="M10 19.5a2 2 0 0 0 4 0"/>',
    megaphone: '<path d="M3.5 10v4a1.5 1.5 0 0 0 1.5 1.5h2L13 19V5L7 8.5H5A1.5 1.5 0 0 0 3.5 10z"/><path d="M16.5 9a4 4 0 0 1 0 6M8 15.5l1 4.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    settings: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5.5 7l1 12.5A1.5 1.5 0 0 0 8 21h8a1.5 1.5 0 0 0 1.5-1.5L18.5 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 16v3.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V16"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  function icon(n, cls) {
    return '<svg class="icon ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[n] || '') + '</svg>';
  }
  function starIcon(on, cls) {
    return '<svg class="icon ' + (cls || 'icon--sm') + '" viewBox="0 0 24 24" fill="' + (on ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true">' + P.star + '</svg>';
  }

  /* ---------- time ---------- */
  var OFF = EV.utcOffset;
  function now() { return SET.previewNow ? new Date(SET.previewNow) : new Date(); }
  var fmtE, fmtDE;
  try {
    fmtE = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: EV.tz });
    fmtDE = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: EV.tz });
  } catch (e) {
    fmtE = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    fmtDE = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }
  var fmtL = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  var fmtDL = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  var localTz = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'your time zone'; } catch (e) { return 'your time zone'; } })();
  var localSameAsEvent = (function () {
    var t = new Date(D.days[1].date + 'T09:00:00' + OFF);
    return fmtL.format(t) === fmtE.format(t) && fmtDL.format(t) === fmtDE.format(t);
  })();
  function dateKey(d, mode) { return (mode === 'local' ? fmtDL : fmtDE).format(d); }
  function timeOf(d) { return (state.tmode === 'local' ? fmtL : fmtE).format(d); }
  function dayShift(d, day) {
    if (state.tmode !== 'local') return '';
    var diff = Math.round((new Date(dateKey(d, 'local') + 'T00:00:00Z') - new Date(day.date + 'T00:00:00Z')) / 86400000);
    return diff ? '<sup>' + (diff > 0 ? '+' : '−') + Math.abs(diff) + 'd</sup>' : '';
  }
  function durShort(m) { m = +m; if (!m) return ''; if (m < 60) return m + ' min'; var h = Math.floor(m / 60), r = m % 60; return h + 'h' + (r ? ' ' + r + 'm' : ''); }
  function durLabel(m) { m = +m; if (!m) return ''; if (m < 60) return m + ' min'; var h = Math.floor(m / 60), r = m % 60; return h + ' h' + (r ? ' ' + r + ' min' : ''); }
  var DAYNAME = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday' };
  function longDate(day) { return (DAYNAME[day.weekday] || day.weekday) + ' ' + day.day + ' ' + ({ Jan: 'January' }[day.month] || day.month); }
  function shortDay(day) { return day.weekday + ' ' + day.day + ' ' + day.month; }

  /* ---------- live data (notices, agenda edits, attendees) ---------- */
  var EMPTY_LIVE = { updated: '1970-01-01T00:00:00Z', notices: [], agenda: { overrides: {}, added: [] } };
  function stamp(o) { return o && Date.parse(o.updated) || 0; }
  function newer(a, b) { if (!a) return b; if (!b) return a; return stamp(b) > stamp(a) ? b : a; }
  function normLive(l) { l = l || clone(EMPTY_LIVE); l.notices = l.notices || []; l.agenda = l.agenda || {}; l.agenda.overrides = l.agenda.overrides || {}; l.agenda.added = l.agenda.added || []; return l; }
  var live = normLive(newer(INLINE.live, store.get('flc.live.cache', null)));
  var attendees = newer(INLINE.attendees, store.get('flc.att.cache', null)) || { updated: '1970-01-01T00:00:00Z', people: [] };
  attendees.people = attendees.people || [];

  /* ---------- sessions index (booklet + live edits) ---------- */
  var ALL = [], byId = {};
  function buildSessions(agenda) {
    var ov = (agenda && agenda.overrides) || {}, added = (agenda && agenda.added) || [], out = [];
    D.days.forEach(function (day) {
      var list = day.sessions.map(function (s, i) {
        var id = day.id + '-' + i, o = ov[id];
        return { s: o ? Object.assign({}, s, o) : s, base: s, id: id, day: day, changed: !!o, added: false };
      });
      added.forEach(function (a) { if (a.day === day.id) list.push({ s: a, base: null, id: a.id, day: day, changed: true, added: true }); });
      list.forEach(function (x) {
        if (!Array.isArray(x.s.who)) x.s = Object.assign({}, x.s, { who: x.s.who ? String(x.s.who).split(',').map(function (w) { return w.trim(); }).filter(Boolean) : [] });
        x.start = new Date(day.date + 'T' + x.s.start + ':00' + OFF);
        x.end = new Date(x.start.getTime() + (+x.s.dur || 0) * 60000);
      });
      list.sort(function (a, b) { return a.start - b.start; });
      out = out.concat(list);
    });
    return out;
  }
  function rebuild() { ALL = buildSessions(live.agenda); byId = {}; ALL.forEach(function (x) { byId[x.id] = x; }); }
  rebuild();

  var SP = {}; D.speakers.forEach(function (sp) { SP[sp.id] = sp; });
  var PLACE = {}; D.places.forEach(function (p) { PLACE[p.id] = p; });
  function speakerFor(name) { for (var i = 0; i < D.speakers.length; i++) if (D.speakers[i].aliases.indexOf(name) > -1 || D.speakers[i].name === name) return D.speakers[i]; return null; }
  function isCeo(name) { return D.ceoAliases.indexOf(name) > -1; }
  function namesFor(name) {
    var sp = speakerFor(name); if (sp) return sp.aliases.concat([sp.name]);
    if (isCeo(name)) return D.ceoAliases;
    var out = [name], first = String(name).split(' ')[0];
    if (first !== name && attendees.people.filter(function (p) { return String(p.name).split(' ')[0] === first; }).length === 1) out.push(first);
    return out;
  }
  function sessionsBy(name) {
    var names = namesFor(name);
    return ALL.filter(function (x) { return !x.s.cancelled && x.s.who.some(function (w) { return names.indexOf(w) > -1; }); });
  }

  /* ---------- state ---------- */
  var state = { user: null, tmode: store.get('flc.tmode', 'event'), filter: 'all', day: null, route: 'home', people: { q: '', f: 'all' } };
  function isAdmin() { return !!(state.user && state.user.role === 'admin'); }
  function userKey() { return state.user ? (state.user.guest ? 'guest' : state.user.name.toLowerCase()) : 'none'; }
  function saved() { return store.get('flc.saved.' + userKey(), []); }
  function isSaved(id) { return saved().indexOf(id) > -1; }
  function toggleSaved(id) {
    var s = saved(), i = s.indexOf(id);
    if (i > -1) s.splice(i, 1); else s.push(id);
    store.set('flc.saved.' + userKey(), s);
    toast(i > -1 ? 'Removed from My agenda' : 'Added to My agenda');
  }

  /* ---------- live status ---------- */
  function liveStatus() {
    var n = now(), act = ALL.filter(function (x) { return !x.s.cancelled; });
    if (!act.length) return { phase: 'after' };
    if (n < act[0].start) return { phase: 'before', ms: act[0].start - n, next: act[0] };
    if (n >= new Date(EV.end)) return { phase: 'after' };
    var cur = null, nxt = null;
    act.forEach(function (x) { if (x.s.dur > 0 && x.start <= n && n < x.end) cur = x; });
    for (var i = 0; i < act.length; i++) if (act[i].start > n) { nxt = act[i]; break; }
    return { phase: 'during', cur: cur, next: nxt };
  }
  function todayDay() { var k = dateKey(now(), 'event'); for (var i = 0; i < D.days.length; i++) if (D.days[i].date === k) return D.days[i]; return null; }
  function defaultDay() { var t = todayDay(); if (t) return t.id; return now() > new Date(EV.end) ? D.days[1].id : D.days[0].id; }

  /* ---------- shared bits ---------- */
  function venue(k) { return D.venues[k] || { name: k || '—' }; }
  function venueLabel(k) { var v = venue(k); return v.name + (v.floor ? ' · ' + v.floor : ''); }
  function venueImage(k) { var v = venue(k); return v.place && PLACE[v.place] ? PLACE[v.place].image : null; }
  function mapsLinks(q) {
    var e = encodeURIComponent(q);
    return '<a class="btn btn--soft btn--sm" href="https://maps.apple.com/?q=' + e + '" target="_blank" rel="noopener">' + icon('map', 'icon--sm') + 'Apple Maps</a>' +
      '<a class="btn btn--soft btn--sm" href="https://uri.amap.com/search?keyword=' + e + '" target="_blank" rel="noopener">' + icon('map', 'icon--sm') + 'Amap 高德</a>';
  }
  function typeChip(s) {
    if (s.cancelled) return '<span class="chip chip--red">Cancelled</span>';
    if (s.keynote) return '<span class="chip chip--green">Keynote' + (s.org ? ' · ' + esc(s.org) : '') + '</span>';
    if (s.type === 'panel') return '<span class="chip chip--blue">' + (/q&a/i.test(s.title) ? 'Q&amp;A' : /roundtable/i.test(s.title) ? 'Roundtable' : 'Panel') + '</span>';
    if (s.type === 'offsite') return '<span class="chip">Off-site</span>';
    if (s.type === 'social') return '<span class="chip">Evening</span>';
    return '';
  }
  function changeChip(x) {
    if (x.s.cancelled) return '';
    if (x.added) return '<span class="chip chip--amber">New</span>';
    if (x.changed) return '<span class="chip chip--amber">Updated' + (x.base && x.base.start !== x.s.start ? ' · was ' + esc(x.base.start) : '') + '</span>';
    return '';
  }
  function whoText(who) { return who.filter(function (w) { return w !== 'All'; }).join(', '); }
  function photoFor(name) { var sp = speakerFor(name); if (sp) return sp.photo; if (isCeo(name)) return D.welcome.photo; return null; }
  function whoChips(who) {
    return who.map(function (w) {
      var sp = speakerFor(w);
      if (sp) return '<a class="who" href="#/speaker/' + sp.id + '"><img src="' + sp.photo + '" alt="">' + esc(sp.name) + '</a>';
      if (isCeo(w)) return '<a class="who" href="#/welcome"><img src="' + D.welcome.photo + '" alt="" style="object-position:center 8%;background:var(--green-50)">Robert Pye</a>';
      if (D.nonPeople.indexOf(w) > -1) return '<span class="who who--plain">' + esc(w) + '</span>';
      return '<button type="button" class="who" data-person="' + esc(w) + '"><i>' + esc(initials(w)) + '</i>' + esc(w) + '</button>';
    }).join('');
  }
  function avatarHtml() {
    var u = state.user;
    return '<button type="button" class="avatar' + (u.guest ? ' avatar--guest' : '') + (isAdmin() ? ' avatar--admin' : '') + '" data-account aria-label="Account: ' + esc(u.guest ? 'Guest' : u.name) + '">' + esc(u.guest ? 'G' : u.initials || initials(u.name)) + '</button>';
  }
  function foot() { return '<footer class="foot"><img src="assets/img/logo.svg" alt="" width="30" height="25"><p>' + esc(EV.name) + ' · ' + esc(EV.dates) + '<br>' + esc(D.hotel.name) + '</p></footer>'; }
  function rowLink(href, ic, title, sub, iconCls) {
    return '<a class="row" href="' + href + '"><span class="row__icon' + (iconCls ? ' ' + iconCls : '') + '">' + icon(ic, 'icon--sm') + '</span><span class="row__main"><span class="row__title">' + title + '</span>' + (sub ? '<span class="row__sub">' + sub + '</span>' : '') + '</span><span class="row__end">' + icon('chev', 'icon--sm') + '</span></a>';
  }
  function sessionRow(x) {
    return '<button type="button" class="row" data-session="' + x.id + '"><span class="row__icon">' + icon('calendar', 'icon--sm') + '</span><span class="row__main"><span class="row__title">' + esc(x.s.title) + '</span><span class="row__sub tnum">' + shortDay(x.day) + ' · ' + timeOf(x.start) + ' · ' + esc(venueLabel(x.s.venue)) + '</span></span><span class="row__end">' + icon('chev', 'icon--sm') + '</span></button>';
  }

  /* =====================================================================
     NOTICES (published by the admin into data/live.json)
     ===================================================================== */
  function activeNotices() {
    var n = now();
    return live.notices.filter(function (x) { return !x.expires || n < new Date(x.expires); })
      .sort(function (a, b) { return Date.parse(b.created) - Date.parse(a.created); });
  }
  function dismissed() { return store.get('flc.dismissed', []); }
  function noticeHtml(x, withClose, footer) {
    var ic = x.level === 'urgent' ? 'alert' : x.level === 'important' ? 'megaphone' : 'bell';
    var t = x.created ? fmtE.format(new Date(x.created)) : '';
    var link = x.session && byId[x.session] ? '<button type="button" data-session="' + esc(x.session) + '">View session</button>' : '';
    return '<div class="notice notice--' + esc(x.level || 'info') + '">' + icon(ic, 'icon--sm') +
      '<div class="notice__body"><p class="notice__text">' + esc(x.text) + '</p><p class="notice__meta"><span>' + (x.level === 'urgent' ? 'Urgent' : x.level === 'important' ? 'Important' : 'Update') + (t ? ' · ' + t : '') + '</span>' + link + '</p>' + (footer || '') + '</div>' +
      (withClose ? '<button type="button" class="icon-btn" data-dismiss="' + esc(x.id) + '" aria-label="Dismiss notice">' + icon('close', 'icon--sm') + '</button>' : '<span></span>') + '</div>';
  }
  /* Banner under the header: only the newest notice, plus a link to all of
     them. Dismissing hides the banner until a newer notice arrives. */
  var lastBannerId = null;
  function renderNotices() {
    var bar = $('#notice-bar'); if (!bar) return;
    var all = activeNotices(), latest = all[0], dis = dismissed();
    var show = latest && dis.indexOf(latest.id) < 0 ? latest : null;
    var dot = $('#bell-dot'); if (dot) dot.hidden = !all.length;
    var shell = $('#shell'); if (shell) shell.classList.toggle('has-notice', !!show);
    if (!show) { bar.classList.add('is-empty'); lastBannerId = null; return; }
    if (lastBannerId === show.id + ':' + all.length && !bar.classList.contains('is-empty')) return;
    lastBannerId = show.id + ':' + all.length;
    bar.innerHTML = '<div class="notice-bar__inner">' + noticeHtml(show, true,
      '<button type="button" class="notice__all" data-notices>' + icon('bell', 'icon--xs') + '<span>View all announcements' + (all.length > 1 ? ' (' + all.length + ')' : '') + ' with the bell icon</span>' + icon('chev', 'icon--xs') + '</button>') + '</div>';
    bar.classList.remove('is-empty');
  }
  /* Phone alerts: the browser can't withdraw a permission once given, so the
     app keeps its own on/off switch on top of it (saved on this phone). */
  function alertState() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'denied') return 'blocked';
    if (Notification.permission !== 'granted') return 'ask';
    return store.get('flc.alerts', true) ? 'on' : 'off';
  }
  function alertRow() {
    var a = alertState(), on = a === 'on';
    var sub = { on: 'On · you’ll get a phone alert for each new notice', off: 'Off · notices still show inside the app', ask: 'Get a phone alert when organisers post a notice', blocked: 'Blocked in this browser’s settings', unsupported: 'iPhone: add the app to your Home Screen first' }[a];
    if (a === 'unsupported') return '<div class="row"><span class="row__icon">' + icon('bell', 'icon--sm') + '</span><span class="row__main"><span class="row__title">Phone alerts</span><span class="row__sub">' + sub + '</span></span><span></span></div>';
    return '<button type="button" class="row" data-alerts role="switch" aria-checked="' + on + '"><span class="row__icon">' + icon('bell', 'icon--sm') + '</span><span class="row__main"><span class="row__title">Phone alerts</span><span class="row__sub">' + sub + '</span></span><span class="switch' + (on ? ' is-on' : '') + '" aria-hidden="true"><i></i></span></button>';
  }
  function noticesSheet() {
    var list = activeNotices();
    openSheet('<p class="eyebrow">From the organisers</p><h2 class="sd__title" id="sheet-title">Notices</h2>' +
      (list.length ? '<div style="display:grid;gap:8px">' + list.map(function (x) { return noticeHtml(x, false); }).join('') + '</div>' : '<p class="muted">No notices right now. Updates from the organisers appear here and at the top of every screen.</p>') +
      '<div class="rows">' + alertRow() + '</div><p class="field__hint">Alerts arrive while the app is open or in the background. You can switch them off here at any time.</p>');
  }
  function announceNew(silent) {
    var seen = store.get('flc.seenNotices', []), fresh = activeNotices().filter(function (x) { return seen.indexOf(x.id) < 0; });
    if (!fresh.length) return;
    store.set('flc.seenNotices', seen.concat(fresh.map(function (x) { return x.id; })));
    if (silent) return;
    toast('New notice: ' + fresh[0].text, 3500);
    try {
      if (alertState() === 'on') {
        var title = 'FLC 2027' + (fresh[0].level === 'urgent' ? ' · Urgent' : '');
        if (navigator.serviceWorker && navigator.serviceWorker.controller) navigator.serviceWorker.ready.then(function (r) { r.showNotification(title, { body: fresh[0].text, icon: 'assets/icons/icon-192.png', tag: fresh[0].id }); });
        else new Notification(title, { body: fresh[0].text });
      }
    } catch (e) {}
  }
  function setLive(d, opts) {
    opts = opts || {};
    live = normLive(d); store.set('flc.live.cache', live); rebuild();
    renderNotices(); announceNew(opts.silent);
    if (state.user && !$('#shell').hidden) {
      var base = state.route.split('/')[0];
      if (base === 'home' || base === 'agenda' || base === 'admin') render(state.route, true);
    }
  }
  function setAttendees(d) {
    attendees = d; attendees.people = attendees.people || []; store.set('flc.att.cache', d);
    var base = state.route.split('/')[0];
    if (state.user && !$('#shell').hidden && (base === 'attendees' || base === 'admin')) render(state.route, true);
  }
  function fetchJSON(path) {
    try { return fetch(path + '?t=' + Date.now(), { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }); }
    catch (e) { return Promise.resolve(null); }
  }
  var firstSync = true;
  function syncLive() {
    var silent = firstSync; firstSync = false;
    fetchJSON('data/live.json').then(function (d) {
      if (d && stamp(d) > stamp(live)) setLive(d, { silent: silent });
      else if (silent) announceNew(true);
    });
    fetchJSON('data/attendees.json').then(function (d) { if (d && stamp(d) > stamp(attendees)) setAttendees(d); });
  }

  /* =====================================================================
     SCREENS
     ===================================================================== */
  var TABS = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'agenda', label: 'Agenda', icon: 'calendar' },
    { id: 'people', label: 'People', icon: 'people' },
    { id: 'explore', label: 'Explore', icon: 'compass' },
    { id: 'info', label: 'Info', icon: 'info' }
  ];
  var TAB_OF = { home: 'home', welcome: 'home', admin: 'home', agenda: 'agenda', speakers: 'people', attendees: 'people', speaker: 'people', explore: 'explore', place: 'explore', china: 'explore', shanghai: 'explore', info: 'info', hotel: 'info', venue: 'info', dress: 'info' };
  var PARENT = { welcome: 'home', admin: 'home', speaker: 'speakers', place: 'explore', china: 'explore', shanghai: 'explore', hotel: 'info', venue: 'info', dress: 'info' };
  var TITLES = { welcome: 'Welcome message', admin: 'Admin', speaker: 'Speaker', place: 'Explore', china: 'About China', shanghai: 'About Shanghai', hotel: 'Your hotel', venue: 'Venue', dress: 'Dress code' };

  function greetingWord() { var h = +fmtE.format(now()).slice(0, 2); return h < 5 ? 'Good evening' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }

  /* ---------- Home ---------- */
  function ring(pct, label, sub) {
    var r = 26, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
    return '<div class="ring" role="img" aria-label="' + esc(label + ' ' + sub) + '"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="' + r + '" class="ring__track"/><circle cx="32" cy="32" r="' + r + '" class="ring__bar" style="stroke-dasharray:' + c.toFixed(1) + ';stroke-dashoffset:' + off.toFixed(1) + '"/></svg><span><b class="tnum">' + esc(label) + '</b><small>' + esc(sub) + '</small></span></div>';
  }
  function minsLeftLabel(ms) { var m = Math.max(0, Math.ceil(ms / 60000)); return m < 60 ? String(m) : Math.floor(m / 60) + ':' + ('0' + (m % 60)).slice(-2); }
  function minsLeftUnit(ms) { return Math.ceil(ms / 60000) < 60 ? 'min left' : 'h left'; }
  function inMins(ms) { var m = Math.max(0, Math.round(ms / 60000)); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60 ? (m % 60) + ' min' : ''); }
  function focusCard() {
    var L = liveStatus(), h = '', n = now();
    var pv = SET.previewNow ? '<p class="preview-note">' + icon('play', 'icon--xs') + 'Preview clock · ' + esc(fmtDE.format(n)) + ' ' + fmtE.format(n) + ' Shanghai</p>' : '';
    if (L.phase === 'before') {
      var m = Math.floor(L.ms / 60000);
      h = '<p class="focus__label">' + icon('clock', 'icon--sm') + 'Countdown to Shanghai</p>' +
        '<div class="countdown tnum"><div><b>' + Math.floor(m / 1440) + '</b><span>days</span></div><div><b>' + Math.floor(m % 1440 / 60) + '</b><span>hours</span></div><div><b>' + (m % 60) + '</b><span>minutes</span></div></div>' + nextRow(L.next, 'First up');
    } else if (L.phase === 'during') {
      if (L.cur) {
        var pct = (n - L.cur.start) / (L.cur.end - L.cur.start);
        var todays = ALL.filter(function (x) { return x.day === L.cur.day && !x.s.cancelled && +x.s.dur; }), idx = todays.indexOf(L.cur) + 1;
        h = '<p class="focus__label"><span class="dot-live"></span>Happening now<span class="focus__count tnum">' + idx + ' of ' + todays.length + ' today</span></p>' +
          '<button type="button" class="focus__now" data-session="' + L.cur.id + '"><span class="focus__main"><span class="focus__title">' + esc(L.cur.s.title) + '</span>' +
          '<span class="focus__meta"><span class="tnum">' + timeOf(L.cur.start) + ' – ' + timeOf(L.cur.end) + '</span><span>' + icon('pin', 'icon--xs') + esc(venueLabel(L.cur.s.venue)) + '</span>' + (whoText(L.cur.s.who) ? '<span>' + icon('user', 'icon--xs') + esc(whoText(L.cur.s.who)) + '</span>' : '') + '</span></span>' +
          ring(pct, minsLeftLabel(L.cur.end - n), minsLeftUnit(L.cur.end - n)) + '</button>' + (L.next ? nextRow(L.next, 'Up next') : '');
      } else {
        h = '<p class="focus__label">' + icon('clock', 'icon--sm') + 'Between sessions</p>' + (L.next ? nextRow(L.next, 'Up next') : '');
      }
    } else {
      h = '<p class="focus__label">' + icon('check', 'icon--sm') + 'That’s a wrap</p><p class="focus__title">Thank you for joining us in Shanghai.</p><p class="focus__meta">The programme, people and city guide stay here for reference.</p>';
    }
    return '<section class="focus" id="focus" aria-label="What’s happening">' + h + pv + '</section>';
  }
  function nextRow(x, label) {
    var dt = x.start - now(), soon = dt > 0 && dt < 6 * 3600000 ? ' · in ' + inMins(dt) : ' · ' + shortDay(x.day);
    return '<button type="button" class="focus__next" data-session="' + x.id + '"><span class="focus__next-time tnum">' + (x.s.timeLabel || timeOf(x.start)) + '</span>' +
      '<span><span class="focus__next-label">' + label + esc(soon) + '</span><span class="focus__next-title">' + esc(x.s.title) + '</span></span>' + icon('chev', 'icon--sm') + '</button>';
  }
  function dressLine(day) {
    return '<div class="dress-line">' + icon('shirt', 'icon--sm') + '<div>' + day.dress.map(function (d) { return '<p><b>' + esc(d.when) + ':</b> ' + esc(d.what) + '</p>'; }).join('') + '</div></div>';
  }
  function welcomeCard() {
    var u = state.user, w = D.welcome, L = liveStatus(), td = todayDay();
    var title = 'Welcome, ' + esc(u.guest ? 'Guest' : (u.greeting || u.name));
    var eyebrow, sub;
    if (L.phase === 'after') { eyebrow = esc(EV.dates) + ' · Shanghai'; sub = 'Thank you for joining us. The guide stays here for reference.'; }
    else if (td) { eyebrow = td.label + ' · ' + longDate(td); sub = esc(td.title) + ' · ' + esc(EV.theme); }
    else { eyebrow = esc(EV.dates) + ' · Shanghai'; sub = 'Filtrona Leadership Conference · ' + esc(EV.theme); }
    return '<section class="hero hero--layered" aria-hidden="true"><div class="hero__media" style="background-image:url(assets/img/lujiazui.jpg)"></div></section>' +
      '<section class="welcome" aria-label="Welcome"><p class="hero__eyebrow">' + eyebrow + '</p><h1 class="hero__title">' + title + '</h1><p class="hero__sub">' + sub + '</p>' +
      '<a class="hero__ceo" href="#/welcome"><span class="hero__ceo-img"><img src="' + w.photo + '" alt=""></span><span><b>A welcome from ' + esc(w.from) + '</b><span>“' + esc(w.pullquote) + '”</span></span>' + icon('chev', 'icon--sm') + '</a></section>';
  }
  function quickLinks() {
    var td = todayDay(), day = td || D.days.filter(function (d) { return d.id === defaultDay(); })[0];
    var todays = ALL.filter(function (x) { return x.day === day && !x.s.cancelled && +x.s.dur; });
    var n = now(), nxt = todays.filter(function (x) { return x.start > n; })[0] || todays[0];
    return '<a class="strip" href="#/agenda/' + day.id + '"><span class="strip__icon">' + icon('calendar') + '</span><span class="strip__text"><b>' + (td ? 'Today’s agenda' : 'Agenda · ' + day.label + ', ' + shortDay(day)) + '</b>' +
      '<span class="tnum">' + todays.length + ' sessions' + (nxt ? ' · next ' + timeOf(nxt.start) + ' ' + esc(nxt.s.title) : '') + '</span></span>' + icon('chev', 'icon--sm') + '</a>' +
      '<nav class="shortcuts" aria-label="Shortcuts">' +
      '<a class="shortcut" href="#/attendees"><span class="shortcut__icon">' + icon('people') + '<i class="shortcut__badge tnum">' + attendees.people.length + '</i></span>Attendees</a>' +
      '<a class="shortcut" href="#/hotel"><span class="shortcut__icon shortcut__icon--blue">' + icon('hotel') + '</span>Hotel</a>' +
      '<a class="shortcut" href="#/dress"><span class="shortcut__icon">' + icon('shirt') + '</span>Dress code</a>' +
      '<a class="shortcut" href="#/info"><span class="shortcut__icon shortcut__icon--red">' + icon('phone') + '</span>Emergency</a></nav>';
  }
  function viewHome() {
    return welcomeCard() +
      '<div class="layer"><div class="home-label"><span class="eyebrow">What’s happening</span></div>' + focusCard() +
      '<div class="stack">' + quickLinks() +
      (isAdmin() ? '<div class="rows rows--inset">' + rowLink('#/admin', 'settings', 'Admin', 'Send a notice, edit the agenda, update attendees') + '</div>' : '') +
      '<section class="section"><div class="section__head"><h2 class="section__title">Conference guide</h2></div><div class="rows rows--inset">' +
      rowLink('#/shanghai', 'globe', 'About Shanghai', 'The city, its metro and its food') +
      rowLink('#/explore', 'compass', 'Explore Shanghai', 'Places and popular routes') +
      rowLink('#/speakers', 'people', 'Speakers', D.speakers.length + ' external guests') +
      '</div></section></div>' + foot() + '</div>';
  }

  /* ---------- Welcome letter ---------- */
  function viewWelcome() {
    var w = D.welcome;
    return '<article class="letter"><div class="letter__top"><div class="letter__top-text"><p class="eyebrow">Chapter 01 · Welcome</p><h1 class="letter__title">A message from our CEO</h1></div><img src="' + w.photo + '" alt="Robert Pye, CEO"></div>' +
      '<p class="letter__salute">' + esc(w.salutation) + '</p><div class="prose">' +
      w.paragraphs.map(function (p, i) { return (i === 2 ? '<p class="letter__pull">' + esc(w.pullquote) + '</p>' : '') + '<p>' + esc(p) + '</p>'; }).join('') +
      '</div><div class="letter__sign"><span>' + esc(w.signoff) + '</span><b>' + esc(w.from) + '</b><span>' + esc(w.role) + '</span></div>' +
      '<section class="section" style="gap:4px"><p class="eyebrow">Robert on stage</p><div class="rows">' + sessionsBy('Robert').map(sessionRow).join('') + '</div></section></article>' + foot();
  }

  /* ---------- Agenda ---------- */
  function viewAgenda(dayId) {
    var day = D.days.filter(function (d) { return d.id === dayId; })[0] || D.days[0];
    state.day = day.id;
    var td = todayDay(), n = now(), L = liveStatus(), sv = saved();
    var list = ALL.filter(function (x) { return x.day === day && (state.filter === 'all' || sv.indexOf(x.id) > -1); });
    var head = '<div class="ag-head"><div class="days" role="group" aria-label="Choose day">' +
      D.days.map(function (d) {
        return '<button type="button" class="day" data-day="' + d.id + '" aria-pressed="' + (d.id === day.id) + '">' + (td && td.id === d.id ? '<span class="day__today" title="Today"></span>' : '') +
          '<span class="day__wd">' + d.weekday + '</span><span class="day__d">' + d.day + '</span><span class="day__lbl">' + d.label + '</span></button>';
      }).join('') + '</div>' +
      '<div class="ag-tools"><div class="seg" role="group" aria-label="Time zone"><button type="button" data-tmode="event" aria-pressed="' + (state.tmode === 'event') + '">Shanghai time</button><button type="button" data-tmode="local" aria-pressed="' + (state.tmode === 'local') + '">My time</button></div>' +
      '<div class="seg" role="group" aria-label="Filter"><button type="button" data-filter="all" aria-pressed="' + (state.filter === 'all') + '">All</button><button type="button" data-filter="saved" aria-pressed="' + (state.filter === 'saved') + '">My agenda</button></div></div></div>';
    var title = '<div class="ag-day"><p class="eyebrow">' + day.label + ' · ' + esc(day.title) + '</p><h2>' + longDate(day) + '</h2>' +
      '<div class="ag-day__dress">' + icon('shirt', 'icon--sm') + '<span>' + day.dress.map(function (d) { return '<b>' + esc(d.when) + ':</b> ' + esc(d.what); }).join('<br>') + '</span></div></div>';
    var tz = '<p class="tz-note">' + (state.tmode === 'local' ? 'Times in ' + esc(localTz) + (localSameAsEvent ? ' (same as Shanghai)' : '') : 'Times in ' + esc(EV.tzLabel)) + '</p>';
    var body;
    if (!list.length) {
      body = '<div class="empty">' + starIcon(false, '') + '<b>Nothing saved for ' + day.weekday + ' yet</b><p>Tap the star on any session to build your own agenda.</p><button type="button" class="btn btn--soft btn--sm" data-filter="all">Show all sessions</button></div>';
    } else {
      body = '<div style="padding-top:6px">' + list.map(function (x) {
        var s = x.s, isLive = !s.cancelled && L.phase === 'during' && L.cur && L.cur.id === x.id;
        var past = !isLive && s.dur > 0 && x.end <= n;
        var quiet = s.type === 'meal' || s.type === 'break' || s.type === 'logistics';
        var on = sv.indexOf(x.id) > -1;
        var star = +s.dur ? '<span class="sess__star' + (on ? ' is-on' : '') + '" data-save="' + x.id + '" role="button" tabindex="0" aria-label="' + (on ? 'Remove from' : 'Add to') + ' My agenda" aria-pressed="' + on + '">' + starIcon(on) + '</span>' : '';
        var meta = '<span class="sess__meta">' + (+s.dur ? '<span>' + icon('pin', 'icon--xs') + esc(venueLabel(s.venue)) + '</span>' : '') + (whoText(s.who) ? '<span>' + icon('user', 'icon--xs') + esc(whoText(s.who)) + '</span>' : '') + '</span>';
        var img = (s.type === 'offsite' || s.type === 'social') && !s.cancelled ? venueImage(s.venue) : null;
        var chips = (isLive ? '<span class="chip chip--green"><span class="dot-live"></span>Now</span>' : '') + typeChip(s) + changeChip(x) + (s.dressNote && !s.cancelled ? '<span class="chip">' + icon('shirt', 'icon--xs') + esc(s.dressNote) + '</span>' : '');
        var card = '<button type="button" class="sess' + (quiet ? ' sess--quiet' : '') + (s.keynote ? ' sess--keynote' : '') + (s.cancelled ? ' sess--cancelled' : '') + '" data-session="' + x.id + '">' +
          '<span class="sess__top">' + chips + '</span><span class="sess__title">' + esc(s.title) + '</span>' + (s.sub ? '<span class="sess__sub">' + esc(s.sub) + '</span>' : '') + meta +
          (img ? '<span class="sess__thumb" style="background-image:url(' + img + ')"></span>' : '') + (isLive ? '<span class="sess__progress" aria-hidden="true"><i style="width:' + Math.min(100, Math.max(2, (n - x.start) / (x.end - x.start) * 100)).toFixed(1) + '%"></i></span>' : '') + star + '</button>';
        return '<div class="tl' + (isLive ? ' tl--live' : '') + (past ? ' tl--past' : '') + '"><div class="tl__time"><b>' + (s.timeLabel ? '—' : timeOf(x.start) + dayShift(x.start, day)) + '</b><span>' + (s.timeLabel ? esc(s.timeLabel) : durShort(s.dur)) + '</span></div><div class="tl__body">' + card + '</div></div>';
      }).join('') + '</div>';
    }
    return head + title + tz + body + foot();
  }

  /* ---------- Session sheet ---------- */
  function dressFor(x) {
    var s = x.s, d = x.day.dress;
    if (s.type === 'social' && s.dressNote) return 'Formal attire. Encouraged to dress in the 1920s “Shanghai Tan” style.';
    if (s.type === 'social') return d[0] ? d[0].what : '—';
    if (s.type === 'offsite') return 'Please dress warmly as the weather will be below 5 °C.';
    for (var i = 0; i < d.length; i++) if (/conference/i.test(d[i].when)) return d[i].what;
    return d[0] ? d[0].what : '—';
  }
  function sessionSheet(id) {
    var x = byId[id]; if (!x) return;
    var s = x.s, v = venue(s.venue), on = isSaved(id);
    var vlink = D.venues[s.venue] && ['airport', 'hotel'].indexOf(s.venue) < 0 ? '#/venue/' + s.venue : null;
    openSheet('<p class="sd__time tnum">' + shortDay(x.day) + ' · ' + (s.timeLabel ? esc(s.timeLabel) : timeOf(x.start) + (+s.dur ? ' – ' + timeOf(x.end) : '')) + '</p>' +
      '<h2 class="sd__title" id="sheet-title">' + esc(s.title) + '</h2>' + (s.sub ? '<p class="sess__sub" style="font-size:16px">' + esc(s.sub) + '</p>' : '') +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' + typeChip(s) + changeChip(x) + (+s.dur ? '<span class="chip">' + icon('clock', 'icon--xs') + durLabel(s.dur) + '</span>' : '') + '</div>' +
      '<div class="sd__grid">' +
      '<div class="sd__row">' + icon('pin', 'icon--sm') + '<div><b>Where</b><p>' + (vlink ? '<a href="' + vlink + '">' + esc(v.name) + '</a>' : esc(v.name)) + (v.floor ? ' · Level ' + esc(v.floor.replace('L', '')) : '') + '</p><p style="font-size:14px;color:var(--muted)">' + (v.building === 'hotel' ? esc(D.hotel.short) : esc(v.note || '')) + '</p></div></div>' +
      (s.who.length ? '<div class="sd__row">' + icon('people', 'icon--sm') + '<div><b>' + (s.who.length > 1 ? 'With' : 'Presented by') + '</b><div class="who-list">' + whoChips(s.who) + '</div></div></div>' : '') +
      (s.notes ? '<div class="sd__row">' + icon('bus', 'icon--sm') + '<div><b>Visit schedule</b><div class="notes">' + s.notes.map(function (n) { return '<div><span>' + esc(n.time) + '</span><p>' + esc(n.text) + '</p></div>'; }).join('') + '</div></div></div>' : '') +
      '<div class="sd__row">' + icon('shirt', 'icon--sm') + '<div><b>Dress code</b><p>' + esc(dressFor(x)) + '</p></div></div></div>' +
      '<div class="sd__actions">' + (+s.dur && !s.cancelled ? '<button type="button" class="btn btn--' + (on ? 'soft' : 'primary') + ' btn--sm" data-save-sheet="' + id + '">' + starIcon(on) + (on ? 'In My agenda' : 'Add to My agenda') + '</button>' : '') +
      (v.maps ? mapsLinks(v.maps) : '') + (isAdmin() ? '<button type="button" class="btn btn--line btn--sm" data-adm-edit="' + esc(id) + '">' + icon('edit', 'icon--sm') + 'Edit session</button>' : '') + '</div>');
  }
  function personSheet(name) {
    var p = attendees.people.filter(function (x) { return x.name === name; })[0];
    var list = sessionsBy(name), sp = speakerFor(name), ph = photoFor(name);
    var sub = [p && p.title, p && p.company].filter(Boolean).join(' · ') || (sp ? sp.role + ' · ' + sp.org : 'Presenter');
    openSheet('<div class="account"><span class="person__av" style="width:56px;height:56px;font-size:19px">' + (ph ? '<img src="' + ph + '" alt="" style="object-position:center 12%">' : esc(initials(name))) + '</span>' +
      '<div><b id="sheet-title">' + esc(name) + '</b><span>' + esc(sub) + '</span></div></div>' +
      (p && p.region ? '<p class="chip" style="width:fit-content">' + icon('globe', 'icon--xs') + esc(p.region) + '</p>' : '') +
      (sp ? '<a class="btn btn--soft btn--block" href="#/speaker/' + sp.id + '">View speaker profile</a>' : isCeo(name) ? '<a class="btn btn--soft btn--block" href="#/welcome">Read Robert’s welcome</a>' : '') +
      (list.length ? '<div class="section" style="gap:4px"><p class="eyebrow">On the agenda</p><div class="rows">' + list.map(sessionRow).join('') + '</div></div>' : ''));
  }
  function accountSheet() {
    var u = state.user, sv = saved().length;
    openSheet('<div class="account">' + avatarHtml() + '<div><b id="sheet-title">' + esc(u.guest ? 'Guest' : u.name) + '</b><span>' + (u.guest ? 'Browsing as a guest' : isAdmin() ? 'Administrator' : 'Signed in') + '</span></div></div>' +
      '<div class="rows">' +
      (isAdmin() ? rowLink('#/admin', 'settings', 'Admin', 'Notices, agenda edits, attendees') : '') +
      '<button type="button" class="row" data-filter-go><span class="row__icon">' + starIcon(false) + '</span><span class="row__main"><span class="row__title">My agenda</span><span class="row__sub">' + sv + ' saved session' + (sv === 1 ? '' : 's') + ' on this phone</span></span><span class="row__end">' + icon('chev', 'icon--sm') + '</span></button>' +
      alertRow() +
      '<button type="button" class="row" data-replay><span class="row__icon">' + icon('play', 'icon--sm') + '</span><span class="row__main"><span class="row__title">Replay the welcome story</span></span><span class="row__end">' + icon('chev', 'icon--sm') + '</span></button>' +
      '<button type="button" class="row" data-signout><span class="row__icon row__icon--red">' + icon('logout', 'icon--sm') + '</span><span class="row__main"><span class="row__title">' + (u.guest ? 'Sign in with a name' : 'Sign out') + '</span></span></button></div>');
  }

  /* ---------- People: speakers + attendees ---------- */
  function peopleSeg(active) {
    return '<div class="seg seg--wide" role="group" aria-label="People"><button type="button" data-go="speakers" aria-pressed="' + (active === 'speakers') + '">Speakers</button><button type="button" data-go="attendees" aria-pressed="' + (active === 'attendees') + '">Attendees · ' + attendees.people.length + '</button></div>';
  }
  function viewSpeakers() {
    var ext = D.speakers.map(function (sp) {
      var ss = sessionsBy(sp.name);
      return '<a class="sp-row" href="#/speaker/' + sp.id + '"><img src="' + sp.photo + '" alt="" loading="lazy"><span style="min-width:0;display:grid;gap:1px">' +
        (sp.label ? '<span class="eyebrow">' + esc(sp.label) + '</span>' : '') +
        '<span class="sp-row__name">' + esc((sp.honorific ? sp.honorific + ' ' : '') + sp.name) + '</span><span class="sp-row__role">' + esc(sp.role) + ', ' + esc(sp.org) + '</span>' +
        (ss.length ? '<span class="sp-row__when"><span class="chip chip--green tnum">' + shortDay(ss[0].day) + ' · ' + timeOf(ss[0].start) + '</span></span>' : '') + '</span>' + icon('chev', 'icon--sm') + '</a>';
    }).join('');
    var seen = {}, internal = [];
    ALL.forEach(function (x) { x.s.who.forEach(function (w) { if (D.nonPeople.indexOf(w) > -1 || speakerFor(w) || isCeo(w) || seen[w]) return; seen[w] = 1; internal.push(w); }); });
    internal.sort();
    return '<div class="page-head wm-tower"><p class="eyebrow">Chapter 09 · The voices</p><h1 class="page-title">People</h1></div><div style="padding-top:14px">' + peopleSeg('speakers') + '</div>' +
      '<div class="stack"><section class="section"><div class="section__head"><h2 class="section__title">External speakers</h2><span class="eyebrow eyebrow--muted">' + D.speakers.length + ' guests</span></div><div>' + ext + '</div></section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Filtrona presenters</h2></div><div class="who-list pad">' +
      '<a class="who" href="#/welcome"><img src="' + D.welcome.photo + '" alt="" style="object-position:center 8%;background:var(--green-50)">Robert Pye · CEO</a>' +
      internal.map(function (n) { return '<button type="button" class="who" data-person="' + esc(n) + '"><i>' + esc(initials(n)) + '</i>' + esc(n) + '</button>'; }).join('') + '</div></section></div>' + foot();
  }
  function isGuest(p) { return p.company && !/filtrona/i.test(p.company); }
  function attendeeList() {
    var q = state.people.q.trim().toLowerCase(), f = state.people.f;
    var list = attendees.people.filter(function (p) {
      if (f === 'filtrona' && isGuest(p)) return false;
      if (f === 'guests' && !isGuest(p)) return false;
      if (f.indexOf('r:') === 0 && p.region !== f.slice(2)) return false;
      return !q || [p.name, p.title, p.company, p.region].join(' ').toLowerCase().indexOf(q) > -1;
    }).sort(function (a, b) { return a.name.localeCompare(b.name); });
    if (!attendees.people.length) return '<div class="empty"><b>Attendee list coming soon</b><p>The organisers will publish it before the conference.</p></div>';
    if (!list.length) return '<div class="empty"><b>No one matches “' + esc(state.people.q) + '”</b><p>Try a first name, company or region.</p></div>';
    var out = '', last = '';
    list.forEach(function (p) {
      var L = p.name.charAt(0).toUpperCase();
      if (L !== last) { out += '<p class="letter-head">' + esc(L) + '</p>'; last = L; }
      var ph = photoFor(p.name);
      out += '<button type="button" class="person" data-person="' + esc(p.name) + '"><span class="person__av">' + (ph ? '<img src="' + ph + '" alt="" style="object-position:center 12%">' : esc(initials(p.name))) + '</span><span style="min-width:0"><span class="person__name" style="display:block">' + esc(p.name) + '</span><span class="person__sub" style="display:block">' + esc([p.title, p.company].filter(Boolean).join(' · ')) + '</span></span>' + (p.region ? '<span class="chip">' + esc(p.region) + '</span>' : '<span></span>') + '</button>';
    });
    return out + '<p class="count-note">' + list.length + ' of ' + attendees.people.length + ' attendees</p>';
  }
  function viewAttendees() {
    var regions = {}; attendees.people.forEach(function (p) { if (p.region) regions[p.region] = 1; });
    var f = state.people.f;
    var filters = [['all', 'All'], ['filtrona', 'Filtrona'], ['guests', 'Guests']].concat(Object.keys(regions).sort().map(function (r) { return ['r:' + r, r]; }));
    return '<div class="page-head wm-tower"><p class="eyebrow">Who’s here</p><h1 class="page-title">People</h1></div><div style="padding-top:14px">' + peopleSeg('attendees') + '</div>' +
      '<div class="people-tools" style="margin-top:10px"><label class="search" for="att-search">' + icon('search', 'icon--sm') + '<input id="att-search" type="search" placeholder="Search name, company or region" value="' + esc(state.people.q) + '" autocomplete="off"></label>' +
      '<div class="filters" role="group" aria-label="Filter attendees">' + filters.map(function (x) { return '<button type="button" class="filter" data-pf="' + esc(x[0]) + '" aria-pressed="' + (f === x[0]) + '">' + esc(x[1]) + '</button>'; }).join('') + '</div></div>' +
      '<div id="att-list">' + attendeeList() + '</div>' + foot();
  }
  function viewSpeaker(id) {
    var sp = SP[id]; if (!sp) return viewSpeakers();
    var ss = sessionsBy(sp.name);
    return '<section class="profile"><img class="profile__img" src="' + sp.photo + '" alt="' + esc(sp.name) + '"><div style="display:grid;gap:4px"><p class="eyebrow">' + esc(sp.label || 'External speaker') + '</p><h1 class="profile__name">' + esc((sp.honorific ? sp.honorific + ' ' : '') + sp.name) + '</h1><p class="profile__role">' + esc(sp.role) + ', ' + esc(sp.org) + '</p></div></section>' +
      '<div class="stack">' + (ss.length ? '<section class="section"><div class="section__head"><h2 class="section__title">On stage</h2></div><div class="rows rows--inset">' + ss.map(sessionRow).join('') + '</div></section>' : '') +
      '<section class="section"><div class="section__head"><h2 class="section__title">Biography</h2></div><div class="pad prose">' + sp.bio.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div></section></div>' + foot();
  }

  /* ---------- Explore ---------- */
  function funCard(img, label, title, text) {
    return '<div class="fun"><img src="' + img + '" alt="" loading="lazy"><div style="min-width:0"><p class="eyebrow">' + esc(label) + '</p>' + (title ? '<h3>' + esc(title) + '</h3>' : '') + '<p>' + esc(text) + '</p></div></div>';
  }
  function figure(src, cap) {
    return '<figure class="figure"><button type="button" class="figure__btn" data-zoom="' + src + '" data-cap="' + esc(cap) + '"><img src="' + src + '" alt="' + esc(cap) + '" loading="lazy"><span class="figure__zoom">' + icon('zoom', 'icon--xs') + 'Enlarge</span></button><figcaption>' + esc(cap) + '</figcaption></figure>';
  }
  function factsGrid(items, two) {
    return '<div class="facts' + (two ? ' facts--2' : '') + '">' + items.map(function (f) { return '<div class="fact"><b>' + esc(f.value) + (f.unit ? ' <small>' + esc(f.unit) + '</small>' : '') + '</b><span>' + esc(f.label) + '</span></div>'; }).join('') + '</div>';
  }
  function viewExplore() {
    return '<div class="page-head wm-tower"><p class="eyebrow">Chapters 02 – 05 · Destination</p><h1 class="page-title">Explore Shanghai</h1><p class="lede">Where the Bund’s heritage faces Lujiazui’s skyline, at the mouth of the Yangtze.</p></div>' +
      '<div class="photo-head" style="background-image:url(' + D.shanghai.hero + ')"></div>' +
      '<div class="stack">' +
      '<div class="intro-row"><a class="intro-tile" href="#/china"><span class="intro-tile__img" style="background-image:url(' + D.china.funFactImage + ')"></span><span><b>About China</b><span>Capital, currency, climate</span></span></a>' +
      '<a class="intro-tile" href="#/shanghai"><span class="intro-tile__img" style="background-image:url(assets/img/skyline-blue.jpg)"></span><span><b>About Shanghai</b><span>24.8M people · 21 rail lines</span></span></a></div>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Places to know</h2></div><div class="hscroll">' +
      D.places.map(function (p) { return '<a class="place" href="#/place/' + p.id + '"><span class="place__img" style="background-image:url(' + p.image + ')"></span><span><span class="place__name" style="display:block">' + esc(p.name) + '</span><span class="place__tag">' + esc(p.tag) + '</span></span></a>'; }).join('') +
      '</div></section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Popular tourist routes</h2></div><div class="pad">' +
      D.routes.map(function (r) { return '<div class="route"><p class="route__name">' + esc(r.name) + '</p><div class="route__stops">' + r.stops.map(function (s, i) { return (i ? '<span class="route__sep" aria-hidden="true"></span>' : '') + '<span class="route__stop">' + esc(s) + '</span>'; }).join('') + '</div></div>'; }).join('') +
      '</div></section>' + funCard(D.shanghai.funFact.image, 'Fun fact', D.shanghai.funFact.title, D.shanghai.funFact.text) + '</div>' + foot();
  }
  function weatherBlock() {
    var W = D.weather;
    return '<section class="section"><div class="section__head"><h2 class="section__title">Weather & what to wear</h2></div><div class="weather">' +
      '<div class="weather__top"><span class="weather__temp tnum">' + W.low + '–' + W.high + ' °C</span><span class="muted">January average</span></div>' +
      '<div><div class="range" role="img" aria-label="Average range ' + W.range + '"></div><div class="range__scale"><span>' + W.low + ' °C nights</span><span>' + W.high + ' °C days</span></div></div>' +
      '<p style="font-size:15px">' + esc(W.note) + ' The off-site visit will be below 5 °C.</p>' +
      '<div class="wear">' + W.wear.map(function (x) { return '<span class="chip">' + esc(x) + '</span>'; }).join('') + '</div></div></section>';
  }
  function viewChina() {
    var C = D.china;
    return '<div class="page-head"><p class="eyebrow">Chapter 02</p><h1 class="page-title">About China</h1></div><div class="photo-head" style="background-image:url(' + C.funFactImage + ')"></div>' +
      '<div class="stack">' + factsGrid(C.facts, true) + '<div class="pad prose"><p>' + esc(C.overview) + '</p></div>' +
      figure(C.map, 'Map of China, with Shanghai on the east coast') + weatherBlock() +
      funCard(C.funFactImage, 'Fun fact', '56 ethnic groups', C.funFact) + '</div>' + foot();
  }
  function viewShanghai() {
    var S = D.shanghai;
    return '<div class="page-head"><p class="eyebrow">Chapter 03</p><h1 class="page-title">About Shanghai</h1></div><div class="photo-head" style="background-image:url(' + S.hero + ')"></div>' +
      '<div class="stack">' + factsGrid(S.stats, true) + '<div class="pad prose"><p>' + esc(S.overview) + '</p></div>' + figure(S.map, 'Shanghai and its central city area') +
      '<section class="section"><div class="section__head"><h2 class="section__title">Getting around</h2>' + icon('train', 'icon--sm') + '</div>' + factsGrid(S.transport.stats) +
      '<div class="pad prose"><p>' + esc(S.transport.text) + '</p></div>' + figure(S.transport.map, 'Shanghai Rail Transit network map') + '</section>' +
      funCard(S.funFact.image, 'Fun fact', S.funFact.title, S.funFact.text) + '</div>' + foot();
  }
  function viewPlace(id) {
    var p = PLACE[id]; if (!p) return viewExplore();
    var ss = p.venue ? ALL.filter(function (x) { return x.s.venue === p.venue; }) : [];
    var v = p.venue ? venue(p.venue) : null;
    return '<div class="photo-head photo-head--tall" style="background-image:url(' + p.image + ')"></div><div class="page-head" style="padding-top:16px"><p class="eyebrow">' + esc(p.tag) + '</p><h1 class="page-title">' + esc(p.name) + '</h1></div>' +
      '<div class="stack">' + factsGrid(p.facts) +
      (ss.length ? '<section class="section"><div class="section__head"><h2 class="section__title">On the agenda</h2></div><div class="rows rows--inset">' + ss.map(sessionRow).join('') + '</div></section>' : '') +
      '<div class="pad prose">' + p.text.split('\n\n').map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>' +
      (p.gallery ? '<div class="hscroll">' + p.gallery.map(function (g) { return '<button type="button" class="gallery-item" data-zoom="' + g + '" data-cap="' + esc(p.name) + '"><img src="' + g + '" alt="" loading="lazy"></button>'; }).join('') + '</div>' : '') +
      (v && v.maps ? '<div class="pad sd__actions">' + mapsLinks(v.maps) + '</div>' : '') + '</div>' + foot();
  }

  /* ---------- Info ---------- */
  function hotelBlock() {
    var H = D.hotel;
    return '<div class="hotel"><a class="hotel__top" href="#/hotel"><img src="' + H.cover + '" alt="" loading="lazy"><span style="min-width:0"><span class="eyebrow">Your hotel</span><span class="hotel__name" style="display:block">' + esc(H.name) + '</span><span class="hotel__addr" style="display:block">' + esc(H.address) + '</span></span></a>' +
      '<div class="actions"><a class="act" href="tel:' + H.phoneHref + '">' + icon('phone') + 'Call</a><button type="button" class="act" data-copy="' + esc(H.address) + '">' + icon('copy') + 'Copy</button>' +
      '<a class="act" href="https://maps.apple.com/?q=' + encodeURIComponent(H.name) + '" target="_blank" rel="noopener">' + icon('map') + 'Map</a><button type="button" class="act" data-taxi>' + icon('car') + 'Taxi card</button></div></div>';
  }
  function dressList() {
    return D.days.map(function (d) {
      return '<div class="dress-day"><p class="dress-day__d">' + d.weekday + ' ' + d.day + '<span>' + d.label + '</span></p><div class="dress-day__items">' + d.dress.map(function (x) { return '<p><b>' + esc(x.when) + ':</b> ' + esc(x.what) + '</p>'; }).join('') + '</div></div>';
    }).join('');
  }
  function viewInfo() {
    var rooms = ['junior', 'merchant', 'marquis1', 'flint', 'lobby'], off = ['central', 'tobacco', 'roosevelt'];
    function vrow(k) {
      var v = venue(k), n = ALL.filter(function (x) { return x.s.venue === k; }).length;
      return rowLink('#/venue/' + k, v.building === 'offsite' ? 'pin' : 'door', esc(v.name) + (v.floor ? ' · ' + v.floor : ''), esc(v.note) + ' · ' + n + ' session' + (n === 1 ? '' : 's'), v.building === 'offsite' ? 'row__icon--blue' : '');
    }
    return '<div class="page-head wm-tower"><p class="eyebrow">Chapter 10 · Essentials</p><h1 class="page-title">Useful information</h1></div>' +
      '<div class="stack">' + hotelBlock() +
      '<section class="section"><div class="section__head"><h2 class="section__title">Emergency contacts</h2></div><div class="sos">' +
      D.emergency.map(function (e) { return '<div class="sos__item"><div><a class="sos__num" href="tel:' + e.number + '">' + e.number + '</a><span class="sos__label">' + esc(e.label) + '</span></div><button type="button" class="icon-btn" data-copy="' + e.number + '" aria-label="Copy ' + esc(e.label) + ' number">' + icon('copy', 'icon--sm') + '</button></div>'; }).join('') +
      '</div><p class="tz-note">Hotel front desk: ' + esc(D.hotel.phone) + '</p></section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Rooms at the hotel</h2><button type="button" class="section__link" data-zoom="' + D.hotel.floorPlan + '" data-cap="Conference floor plan">Floor plan</button></div><div class="rows rows--inset">' + rooms.map(vrow).join('') + '</div></section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Off-site venues</h2></div><div class="rows rows--inset">' + off.map(vrow).join('') + '</div></section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Dress code</h2></div><div class="pad">' + dressList() + '</div></section>' +
      weatherBlock() +
      '<section class="section"><div class="section__head"><h2 class="section__title">At a glance</h2></div>' + factsGrid([{ label: 'Currency', value: 'RMB (¥)' }, { label: 'Language', value: 'Chinese' }, { label: 'Time zone', value: 'UTC+8' }, { label: 'Metro lines', value: '21' }], true) + '</section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Booklet chapters</h2></div><div class="rows rows--inset">' +
      rowLink('#/welcome', 'megaphone', 'Welcome message', 'From Robert Pye, CEO') + rowLink('#/china', 'globe', 'About China', 'Facts and weather') + rowLink('#/shanghai', 'train', 'About Shanghai', 'The city and its metro') + rowLink('#/hotel', 'hotel', 'About the hotel', 'Rooms, spaces and floor plan') +
      '</div></section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Account</h2></div><div class="rows rows--inset">' +
      (isAdmin() ? rowLink('#/admin', 'settings', 'Admin', 'Notices, agenda edits, attendees') : '') +
      '<button type="button" class="row" data-account><span class="row__icon">' + icon('user', 'icon--sm') + '</span><span class="row__main"><span class="row__title">' + esc(state.user.guest ? 'Guest' : state.user.name) + '</span><span class="row__sub">My agenda, alerts and sign out</span></span><span class="row__end">' + icon('chev', 'icon--sm') + '</span></button></div></section>' +
      '</div>' + foot();
  }
  function viewDress() {
    return '<div class="page-head wm-tower"><p class="eyebrow">Plan your wardrobe</p><h1 class="page-title">Dress code & weather</h1></div><div class="stack"><div class="pad">' + dressList() + '</div>' + weatherBlock() + '</div>' + foot();
  }
  function viewHotel() {
    var H = D.hotel;
    return '<div class="page-head"><p class="eyebrow">Chapter 04 · Your hotel</p><h1 class="page-title">JW Marriott Marquis Shanghai Pudong</h1></div><div class="photo-head photo-head--tall" style="background-image:url(assets/img/hotel-lobby.jpg)"></div>' +
      '<div class="stack">' + hotelBlock() + factsGrid(H.stats, true) + '<div class="pad prose"><p>' + esc(H.description) + '</p></div>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Inside the hotel</h2></div><div class="hscroll">' +
      H.gallery.map(function (g) { return '<button type="button" class="gallery-item" data-zoom="' + g.src + '" data-cap="' + esc(g.caption) + '"><img src="' + g.src + '" alt="' + esc(g.caption) + '" loading="lazy"><span>' + esc(g.caption) + '</span></button>'; }).join('') + '</div></section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Conference floor</h2></div>' + figure(H.floorPlan, 'Floor plan: entrance, Rockery and Junior Marquis halls') + '</section></div>' + foot();
  }
  function viewVenue(k) {
    var v = D.venues[k]; if (!v) return viewInfo();
    var ss = ALL.filter(function (x) { return x.s.venue === k; }), p = v.place ? PLACE[v.place] : null;
    var img = p ? p.image : v.building === 'hotel' ? ({ merchant: 'assets/img/hotel-restaurant.jpg', marquis1: 'assets/img/hotel-dining.jpg', flint: 'assets/img/hotel-dining.jpg', lobby: 'assets/img/hotel-lobby.jpg' }[k] || 'assets/img/hotel-ballroom.jpg') : 'assets/img/bund.jpg';
    return '<div class="photo-head" style="background-image:url(' + img + ')"></div><div class="page-head" style="padding-top:16px"><p class="eyebrow">' + (v.building === 'hotel' ? esc(D.hotel.short) + (v.floor ? ' · Level ' + v.floor.replace('L', '') : '') : 'Off-site venue') + '</p><h1 class="page-title">' + esc(v.name) + '</h1><p class="lede">' + esc(v.note) + '</p></div>' +
      '<div class="stack">' + (ss.length ? '<section class="section"><div class="section__head"><h2 class="section__title">Sessions here</h2><span class="eyebrow eyebrow--muted">' + ss.length + '</span></div><div class="rows rows--inset">' + ss.map(sessionRow).join('') + '</div></section>' : '') +
      (v.building === 'hotel' ? figure(D.hotel.floorPlan, 'Conference floor plan') : '') +
      (p ? '<div class="pad"><a class="btn btn--soft btn--block" href="#/place/' + p.id + '">About ' + esc(p.name) + '</a></div>' : '') +
      (v.maps ? '<div class="pad sd__actions">' + mapsLinks(v.maps) + '</div>' : '') + '</div>' + foot();
  }

  /* =====================================================================
     SHELL: top bar, tab bar, router
     ===================================================================== */
  function topbar(r) {
    var base = r.split('/')[0], isTab = !PARENT[base];
    var left = isTab
      ? '<a class="topbar__brand" href="#/home" aria-label="Home"><img src="assets/img/logo.svg" alt="" width="30" height="25"><span>FLC 2027<small>Shanghai</small></span></a><span class="topbar__spacer"></span>'
      : '<button type="button" class="icon-btn topbar__back" data-back aria-label="Back">' + icon('back') + '</button><span class="topbar__title">' + (TITLES[base] || '') + '</span>';
    $('#topbar').innerHTML = '<div class="topbar__row">' + left + '<button type="button" class="icon-btn" data-notices aria-label="Notices">' + icon('bell') + '<span class="badge-dot" id="bell-dot"' + (activeNotices().length ? '' : ' hidden') + '></span></button>' + avatarHtml() + '</div>';
  }
  function tabbar(r) {
    var cur = TAB_OF[r.split('/')[0]] || 'home';
    $('#tabbar').innerHTML = TABS.map(function (t) {
      var href = t.id === 'agenda' ? '#/agenda/' + (state.day || defaultDay()) : t.id === 'people' ? '#/speakers' : '#/' + t.id;
      return '<a class="tab" href="' + href + '"' + (t.id === cur ? ' aria-current="page"' : '') + '>' + icon(t.icon) + '<span>' + t.label + '</span></a>';
    }).join('');
  }

  var admin = null;
  var scrollMem = {}, navDir = 'fwd';
  function render(r, keepScroll) {
    r = r || 'home';
    var parts = r.split('/'), base = parts[0], arg = parts[1], html;
    if (base === 'admin' && (!isAdmin() || !admin)) { base = 'home'; r = 'home'; }
    switch (base) {
      case 'agenda': html = viewAgenda(arg || state.day || defaultDay()); r = 'agenda/' + state.day; break;
      case 'speakers': case 'people': html = viewSpeakers(); r = 'speakers'; break;
      case 'attendees': html = viewAttendees(); break;
      case 'speaker': html = viewSpeaker(arg); break;
      case 'explore': html = viewExplore(); break;
      case 'place': html = viewPlace(arg); break;
      case 'china': html = viewChina(); break;
      case 'shanghai': html = viewShanghai(); break;
      case 'info': html = viewInfo(); break;
      case 'hotel': html = viewHotel(); break;
      case 'venue': html = viewVenue(arg); break;
      case 'dress': html = viewDress(); break;
      case 'welcome': html = viewWelcome(); break;
      case 'admin': html = admin.view(arg || 'notices'); break;
      default: html = viewHome(); r = 'home';
    }
    scrollMem[state.route] = window.scrollY;
    var sameRoute = state.route === r;
    state.route = r;
    topbar(r); tabbar(r); renderNotices();
    var v = $('#view');
    v.classList.remove('view-enter');
    v.innerHTML = html;
    if (!keepScroll && !sameRoute) { void v.offsetWidth; v.classList.add('view-enter'); clearTimeout(render.t); render.t = setTimeout(function () { v.classList.remove('view-enter'); }, 900); }
    if (!keepScroll) window.scrollTo(0, navDir === 'back' ? scrollMem[r] || 0 : 0);
    navDir = 'fwd'; onScroll(); if (typeof report === 'function') report();
  }

  var depth = 0, memStack = [];
  function currentHashRoute() { try { return (location.hash || '').replace(/^#\/?/, ''); } catch (e) { return ''; } }
  function go(r) {
    closeSheet();
    var ok = false;
    try {
      if (currentHashRoute() === r) { render(r); return; }
      location.hash = '/' + r; ok = currentHashRoute() === r; if (ok) depth++;
    } catch (e) { ok = false; }
    if (!ok) { memStack.push(state.route); render(r); }
  }
  function replaceRoute(r) { try { history.replaceState(null, '', '#/' + r); } catch (e) {} render(r); }
  function back() {
    navDir = 'back';
    if (depth > 0) { depth--; try { history.back(); return; } catch (e) {} }
    if (memStack.length) { render(memStack.pop()); return; }
    go(PARENT[state.route.split('/')[0]] || 'home');
  }
  window.addEventListener('hashchange', function () {
    if (!state.user || $('#shell').hidden) return;
    var r = currentHashRoute() || 'home';
    if (r !== state.route) render(r);
  });

  /* ---------- sheet / lightbox / toast ---------- */
  var lastFocus = null;
  function openSheet(html) {
    lastFocus = document.activeElement;
    $('#sheet-body').innerHTML = html; $('#sheet').hidden = false; document.body.style.overflow = 'hidden';
    var c = $('.sheet__close'); c.innerHTML = icon('close'); try { c.focus({ preventScroll: true }); } catch (e) {}
    $('.sheet__panel').scrollTop = 0;
  }
  function closeSheet() {
    if ($('#sheet').hidden) return;
    $('#sheet').hidden = true; document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) try { lastFocus.focus({ preventScroll: true }); } catch (e) {}
  }
  function openLightbox(src, cap) {
    $('#lightbox-img').src = src; $('#lightbox-img').alt = cap || ''; $('#lightbox-cap').textContent = cap || '';
    $('#lightbox-stage').classList.remove('is-zoomed'); $('#lightbox-close').innerHTML = icon('close');
    $('#lightbox').hidden = false; document.body.style.overflow = 'hidden';
  }
  function closeLightbox() { $('#lightbox').hidden = true; if ($('#sheet').hidden) document.body.style.overflow = ''; }
  function openTaxi() {
    $('#taxi-name').textContent = D.hotel.name; $('#taxi-addr').textContent = D.hotel.address; $('#taxi-tel').textContent = 'Tel ' + D.hotel.phone;
    $('#taxi-close').innerHTML = icon('close'); $('#taxi').hidden = false;
  }
  var toastT;
  function toast(msg, ms) { var t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, ms || 2200); }
  function copy(text, label) {
    function fallback() {
      var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); var ok = false; try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta); toast(ok ? 'Copied' + (label ? ' ' + label : '') : 'Copy failed. Select the text instead.');
    }
    try { navigator.clipboard.writeText(text).then(function () { toast(label ? 'Copied ' + label : 'Copied: ' + (text.length > 40 ? text.slice(0, 40) + '…' : text)); }, fallback); } catch (e) { fallback(); }
  }
  function toggleAlerts(btn) {
    var a = alertState();
    function refresh() { var r = btn && btn.closest('.rows'); if (r && btn.parentNode) { var tmp = document.createElement('div'); tmp.innerHTML = alertRow(); btn.replaceWith(tmp.firstChild); } }
    if (a === 'on') { store.set('flc.alerts', false); toast('Phone alerts off. Notices still show in the app.'); refresh(); return; }
    if (a === 'off') { store.set('flc.alerts', true); toast('Phone alerts on'); refresh(); return; }
    if (a === 'blocked') { toast('Alerts are blocked for this site in your browser settings. Allow notifications there to turn them on.', 4500); return; }
    try {
      Notification.requestPermission().then(function (p) {
        if (p === 'granted') store.set('flc.alerts', true);
        toast(p === 'granted' ? 'Phone alerts on' : 'Alerts not allowed on this phone'); refresh();
      });
    } catch (e) { toast('This browser can’t show alerts'); }
  }

  /* ---------- global events ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target : e.target.parentElement, el;
    if (!t || !t.closest) return;
    if (admin && admin.onClick(e, t)) return;
    if ((el = t.closest('[data-save]'))) { e.preventDefault(); e.stopPropagation(); toggleSaved(el.getAttribute('data-save')); render(state.route, true); return; }
    if ((el = t.closest('[data-save-sheet]'))) { var sid = el.getAttribute('data-save-sheet'); toggleSaved(sid); sessionSheet(sid); render(state.route, true); return; }
    if ((el = t.closest('[data-session]'))) { sessionSheet(el.getAttribute('data-session')); return; }
    if ((el = t.closest('[data-person]'))) { personSheet(el.getAttribute('data-person')); return; }
    if ((el = t.closest('[data-close-sheet]'))) { closeSheet(); return; }
    if ((el = t.closest('[data-dismiss]'))) { var d = dismissed(); d.push(el.getAttribute('data-dismiss')); store.set('flc.dismissed', d.slice(-100)); renderNotices(); return; }
    if ((el = t.closest('[data-notices]'))) { noticesSheet(); return; }
    if ((el = t.closest('[data-alerts]'))) { toggleAlerts(el); return; }
    if ((el = t.closest('[data-day]'))) { replaceRoute('agenda/' + el.getAttribute('data-day')); return; }
    if ((el = t.closest('[data-go]'))) { replaceRoute(el.getAttribute('data-go')); return; }
    if ((el = t.closest('[data-pf]'))) { state.people.f = el.getAttribute('data-pf'); $$('[data-pf]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); $('#att-list').innerHTML = attendeeList(); return; }
    if ((el = t.closest('[data-tmode]'))) { state.tmode = el.getAttribute('data-tmode'); store.set('flc.tmode', state.tmode); render(state.route, true); return; }
    if ((el = t.closest('[data-filter]'))) { state.filter = el.getAttribute('data-filter'); render(state.route, true); return; }
    if ((el = t.closest('[data-filter-go]'))) { state.filter = 'saved'; go('agenda/' + (state.day || defaultDay())); return; }
    if ((el = t.closest('[data-back]'))) { back(); return; }
    if ((el = t.closest('[data-account]'))) { accountSheet(); return; }
    if ((el = t.closest('[data-signout]'))) { closeSheet(); signOut(); return; }
    if ((el = t.closest('[data-replay]'))) { closeSheet(); startOnboarding(); return; }
    if ((el = t.closest('[data-zoom]'))) { openLightbox(el.getAttribute('data-zoom'), el.getAttribute('data-cap')); return; }
    if ((el = t.closest('[data-copy]'))) { copy(el.getAttribute('data-copy')); return; }
    if ((el = t.closest('[data-taxi]'))) { openTaxi(); return; }
    if ((el = t.closest('a[href^="#/"]'))) { e.preventDefault(); go(el.getAttribute('href').slice(2)); }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'att-search') { state.people.q = e.target.value; $('#att-list').innerHTML = attendeeList(); }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { if (!$('#lightbox').hidden) closeLightbox(); else if (!$('#taxi').hidden) $('#taxi').hidden = true; else closeSheet(); }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[data-save]')) { e.preventDefault(); e.target.click(); }
  });
  $('#lightbox-close').addEventListener('click', closeLightbox);
  $('#lightbox-img').addEventListener('click', function () { $('#lightbox-stage').classList.toggle('is-zoomed'); });
  $('#taxi-close').addEventListener('click', function () { $('#taxi').hidden = true; });
  function onScroll() { var tb = $('#topbar'); if (tb) tb.classList.toggle('is-scrolled', window.scrollY > 4); }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* =====================================================================
     SIGN IN · ONBOARDING
     ===================================================================== */
  function show(id) { ['screen-login', 'screen-onboard', 'shell'].forEach(function (s) { $('#' + s).hidden = s !== id; }); window.scrollTo(0, 0); if (typeof report === 'function') setTimeout(report, 0); }
  /* Name-only entry. Only the admin account has a password. */
  function tidyName(n) {
    n = String(n || '').replace(/\s+/g, ' ').trim();
    if (n && (n === n.toLowerCase() || n === n.toUpperCase())) n = n.toLowerCase().replace(/(^|[\s\-'])(\S)/g, function (m, a, c) { return a + c.toUpperCase(); });
    return n;
  }
  function adminFor(name) {
    var n = String(name || '').replace(/\s+/g, ' ').trim().toUpperCase();
    return USERS.filter(function (u) { return u.role === 'admin' && String(u.name).toUpperCase() === n; })[0] || null;
  }
  function personUser(raw) {
    var n = tidyName(raw);
    var match = attendees.people.filter(function (p) { return String(p.name).toLowerCase() === n.toLowerCase(); })[0];
    if (match) n = match.name;
    return { name: n, greeting: n.split(' ')[0], initials: initials(n), role: '' };
  }
  function adminUser(a) { return { name: a.name, greeting: a.greeting || 'Admin', initials: a.initials || 'A', role: 'admin' }; }
  function passOk(a, p) { var up = String(a.password), q = String(p || '').trim(); return up === q || up.replace(/\.$/, '') === q.replace(/\.$/, ''); }
  function syncAdminField() {
    var isAdm = !!adminFor($('#login-name').value);
    $('#login-pass-wrap').hidden = !isAdm;
    $('#login-go').textContent = isAdm ? 'Sign in as admin' : 'Continue';
    if (!isAdm) $('#login-pass').value = '';
  }
  $('#login-name').addEventListener('input', function () { syncAdminField(); $('#login-error').hidden = true; });
  $('#login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = $('#login-name').value, err = $('#login-error'), a = adminFor(raw);
    if (a) {
      if (!passOk(a, $('#login-pass').value)) { err.textContent = 'That password isn’t right for the admin account.'; err.hidden = false; $('#login-pass').focus(); return; }
      err.hidden = true; signIn(adminUser(a)); return;
    }
    if (tidyName(raw).length < 2) { err.textContent = 'Type your name to continue, for example “Manfei Qi”.'; err.hidden = false; $('#login-name').focus(); return; }
    err.hidden = true; signIn(personUser(raw));
  });
  $('#login-guest').addEventListener('click', function () { signIn({ guest: true, name: 'Guest' }); });
  $('#login-show').addEventListener('click', function () {
    var i = $('#login-pass'), showing = i.type === 'text';
    i.type = showing ? 'password' : 'text'; this.textContent = showing ? 'Show' : 'Hide'; this.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  });
  function signIn(u) {
    state.user = u; store.set('flc.user', u); $('#login-pass').value = ''; $('#login-name').value = ''; syncAdminField();
    if (u.role !== 'admin' && SET.showOnboarding !== false && !store.get('flc.onboarded.' + userKey(), false)) startOnboarding();
    else enterApp(u.role === 'admin' ? 'admin' : null);
  }
  function signOut() {
    store.del('flc.user'); state.user = null;
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    show('screen-login');
  }
  function enterApp(r) { show('shell'); render(r || currentHashRoute() || 'home'); }

  var obIndex = 0;
  function startOnboarding() {
    var w = D.welcome, u = state.user;
    var slides = [
      '<div class="slide"><div class="slide__photo" style="background-image:url(assets/img/lujiazui.jpg);background-position:center 60%"><img class="slide__logo" src="assets/img/logo.svg" alt=""></div><div class="slide__content slide__sheet">' +
        '<p class="eyebrow">Welcome' + (u && !u.guest ? ', ' + esc(u.greeting || u.name) : '') + '</p><h1 class="slide__title">Driving Change, <em>Delivering Results</em></h1>' +
        '<p class="slide__quote">“' + esc(w.pullquote) + '”<small>' + esc(w.from) + ', ' + esc(w.role) + '</small></p></div></div>',
      '<div class="slide"><div class="slide__photo" style="background-image:url(' + D.shanghai.hero + ')"></div><div class="slide__content slide__sheet">' +
        '<p class="eyebrow">Your destination</p><h1 class="slide__title">Shanghai, at the mouth of the Yangtze</h1>' +
        '<div class="slide__stats"><div class="slide__stat"><b>24.8M</b><span>residents</span></div><div class="slide__stat"><b>21</b><span>rail lines</span></div><div class="slide__stat"><b>3–11°</b><span>in January</span></div></div></div></div>',
      '<div class="slide slide--short"><div class="slide__photo" style="background-image:url(assets/img/bund.jpg)"></div><div class="slide__content slide__sheet">' +
        '<p class="eyebrow">The programme</p><h1 class="slide__title">Four days, one direction</h1><div class="slide__days">' +
        D.days.map(function (d) { return '<div class="slide__day"><b>' + d.label + '<span>' + shortDay(d) + '</span></b><p>' + esc(d.highlight || d.title) + '</p></div>'; }).join('') + '</div></div></div>'
    ];
    $('#onboard-track').innerHTML = slides.join('');
    $('#onboard-progress').innerHTML = slides.map(function () { return '<i></i>'; }).join('');
    obIndex = 0; show('screen-onboard'); $('#onboard-track').scrollLeft = 0; obUpdate();
  }
  function obUpdate() {
    var n = $$('#onboard-track .slide').length;
    $('#onboard-count').textContent = (obIndex + 1) + ' of ' + n;
    $$('#onboard-progress i').forEach(function (b, i) { b.classList.toggle('is-on', i <= obIndex); });
    $('#onboard-next').textContent = obIndex === n - 1 ? 'Enter the conference' : 'Next';
  }
  function obGo(i) { var tr = $('#onboard-track'); obIndex = i; tr.scrollTo({ left: tr.clientWidth * i, behavior: 'smooth' }); obUpdate(); }
  function obDone() { store.set('flc.onboarded.' + userKey(), true); enterApp(); }
  $('#onboard-next').addEventListener('click', function () { var n = $$('#onboard-track .slide').length; if (obIndex >= n - 1) obDone(); else obGo(obIndex + 1); });
  $('#onboard-skip').addEventListener('click', obDone);
  var obT;
  $('#onboard-track').addEventListener('scroll', function () { clearTimeout(obT); var tr = this; obT = setTimeout(function () { var i = Math.round(tr.scrollLeft / tr.clientWidth); if (i !== obIndex) { obIndex = i; obUpdate(); } }, 80); });

  /* ---------- preview bridge ----------
     preview.html shows this app inside a phone frame and drives it with
     messages (sign in as, sign out, replay the welcome story, go to a screen).
     Only the parent page on the same site is obeyed; the Claude preview build
     sets FLC_PREVIEW_HOST because it runs in a sandboxed frame. */
  var inFrame = (function () { try { return window.parent && window.parent !== window; } catch (e) { return false; } })();
  var CONFIG_NOW = SET.previewNow;
  function bridgeOk(e) { return inFrame && e.source === window.parent && (e.origin === location.origin || window.FLC_PREVIEW_HOST === true); }
  function report() {
    if (!inFrame) return;
    var screen = !$('#shell').hidden ? 'app' : !$('#screen-onboard').hidden ? 'story' : 'login';
    try { window.parent.postMessage({ flc: 'state', user: state.user ? (state.user.guest ? 'Guest' : state.user.name) : '', route: screen === 'app' ? state.route : '', screen: screen }, window.FLC_PREVIEW_HOST ? '*' : location.origin); } catch (e) {}
  }
  function userFromName(name) {
    if (!name || name === 'Guest') return { guest: true, name: 'Guest' };
    var a = adminFor(name);
    return a ? adminUser(a) : personUser(name);
  }
  window.addEventListener('message', function (e) {
    var m = e.data; if (!m || typeof m !== 'object' || !m.flc || !bridgeOk(e)) return;
    if (m.insets) { var rs = document.documentElement.style; rs.setProperty('--safe-t', (+m.insets.top || 0) + 'px'); rs.setProperty('--safe-b', (+m.insets.bottom || 0) + 'px'); }
    if (m.flc === 'insets') return;
    closeSheet();
    if ('now' in m) { SET.previewNow = m.now === 'real' ? null : (m.now || CONFIG_NOW); rebuild(); }
    if (m.flc === 'clock') { if (state.user && !$('#shell').hidden) render(state.route, true); }
    else if (m.flc === 'signin') {
      var u = userFromName(m.user); if (!u) return;
      state.user = u; store.set('flc.user', u); store.set('flc.onboarded.' + userKey(), true);
      show('shell'); replaceRoute(m.route || (u.role === 'admin' ? 'admin' : 'home'));
    } else if (m.flc === 'go') {
      if (!state.user) { state.user = userFromName('Guest'); store.set('flc.user', state.user); }
      show('shell'); replaceRoute(m.route || 'home');
    } else if (m.flc === 'signout') {
      signOut();
    } else if (m.flc === 'story') {
      var su = userFromName(m.user) || userFromName('Guest');
      state.user = su; store.set('flc.user', su); store.del('flc.onboarded.' + userKey());
      startOnboarding();
    } else if (m.flc === 'reset') {
      try { Object.keys(localStorage).filter(function (k) { return k.indexOf('flc.') === 0 && k.indexOf('flc.preview') !== 0; }).forEach(function (k) { localStorage.removeItem(k); }); } catch (err) {}
      state.user = null; state.filter = 'all'; signOut();
    }
    report();
  });

  /* ---------- admin module (js/admin.js) ---------- */
  if (typeof window.FLC_ADMIN === 'function') {
    admin = window.FLC_ADMIN({
      D: D, SET: SET, store: store, esc: esc, icon: icon, clone: clone, toast: toast, copy: copy,
      openSheet: openSheet, closeSheet: closeSheet,
      getLive: function () { return live; }, setLive: setLive, getAttendees: function () { return attendees; }, setAttendees: setAttendees,
      buildSessions: buildSessions, venueLabel: venueLabel, durLabel: durLabel, shortDay: shortDay, fmtE: fmtE, now: now,
      rerender: function () { render(state.route, true); }, replaceRoute: replaceRoute, activeNotices: activeNotices, foot: foot,
      allSessions: function () { return ALL; }, sessionById: function (id) { return byId[id]; }
    });
  }

  /* ---------- live refresh ---------- */
  setInterval(function () {
    if (!state.user || $('#shell').hidden || !$('#sheet').hidden) return;
    var base = state.route.split('/')[0];
    if (base === 'home' && $('#focus')) { var tmp = document.createElement('div'); tmp.innerHTML = focusCard(); $('#focus').replaceWith(tmp.firstChild); }
    if (base === 'agenda' && !SET.previewNow) render(state.route, true);
    renderNotices();
  }, 30000);
  setInterval(syncLive, Math.max(20, +SET.pollSeconds || 60) * 1000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) syncLive(); });

  /* ---------- boot ---------- */
  var savedUser = store.get('flc.user', null);
  var savedOk = savedUser && savedUser.name && (savedUser.role === 'admin' ? !!adminFor(savedUser.name) : true);
  if (savedOk) { state.user = savedUser; enterApp(); }
  else show('screen-login');
  syncLive();
  if (inFrame) { try { window.parent.postMessage({ flc: 'ready' }, window.FLC_PREVIEW_HOST ? '*' : location.origin); } catch (e) {} }

  if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.FLC_NO_SW) {
    window.addEventListener('load', function () { try { navigator.serviceWorker.register('sw.js').catch(function () {}); } catch (e) {} });
  }
})();

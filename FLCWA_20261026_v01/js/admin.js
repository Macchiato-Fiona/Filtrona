/* =====================================================================
   FLC 2027 — Admin page
   For the "admin" account in config/users.js. No server: changes are
   written to data/live.json and data/attendees.json in the GitHub repo
   through the GitHub API, using a personal access token that is saved
   only on the admin's own phone. Every open phone checks those files
   about once a minute and shows new notices as a banner (and a system
   alert if the person allowed alerts).
   Without a token, changes apply to this phone only (useful for rehearsal).
   ===================================================================== */
window.FLC_ADMIN = function (A) {
  'use strict';
  var esc = A.esc, icon = A.icon, store = A.store, D = A.D;
  var tab = 'notices', agDay = 'd1', busy = false, parsed = null, attFilter = '';

  /* ---------- GitHub connection ---------- */
  function detect() {
    /* https://<owner>.github.io/<repo>/<folder…>/index.html → owner, repo, folder */
    var h = location.hostname, owner = '', repo = '', folder = '';
    if (/\.github\.io$/i.test(h)) {
      owner = h.split('.')[0];
      var segs = location.pathname.split('/').filter(Boolean);
      if (segs.length && /\.html?$/i.test(segs[segs.length - 1])) segs.pop();
      if (segs.length) { repo = segs.shift(); folder = segs.join('/'); } else repo = h;
    }
    return { owner: owner, repo: repo, folder: folder };
  }
  function gh() {
    var c = store.get('flc.admin.gh', {}), d = detect(), s = (A.SET.github || {});
    var folder = c.folder != null && c.folder !== '' ? c.folder : (s.folder || d.folder || '');
    return { owner: c.owner || s.owner || d.owner, repo: c.repo || s.repo || d.repo, branch: c.branch || s.branch || 'main', folder: folder.replace(/^\/+|\/+$/g, ''), token: c.token || '' };
  }
  function connected() { var g = gh(); return !!(g.token && g.owner && g.repo); }
  function b64(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
  function api(path, opts) {
    var g = gh();
    opts = opts || {};
    opts.headers = Object.assign({ Authorization: 'Bearer ' + g.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, opts.headers || {});
    return fetch('https://api.github.com/repos/' + encodeURIComponent(g.owner) + '/' + encodeURIComponent(g.repo) + path, opts);
  }
  function explain(status) {
    if (status === 401) return 'GitHub rejected the access token. Create a new token in Setup and paste it again.';
    if (status === 403) return 'The token can’t write to this repository. Give it “Contents: Read and write” permission.';
    if (status === 404) return 'Repository not found. Check the owner and repository names in Setup, and that the token can access it.';
    return 'GitHub returned an error (' + status + '). Try again in a minute.';
  }
  function ghPut(path, obj, message, retried) {
    var g = gh(), url = '/contents/' + (g.folder ? g.folder.split('/').map(encodeURIComponent).join('/') + '/' : '') + path;
    return api(url + '?ref=' + encodeURIComponent(g.branch)).then(function (r) {
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(explain(r.status));
      return r.json();
    }).then(function (cur) {
      return api(url, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message, content: b64(JSON.stringify(obj, null, 2) + '\n'), branch: g.branch, sha: cur ? cur.sha : undefined })
      });
    }).then(function (r) {
      if ((r.status === 409 || r.status === 422) && !retried) return ghPut(path, obj, message, true);
      if (!r.ok) throw new Error(explain(r.status));
      return true;
    }, function (e) {
      if (e && /GitHub|Repository|token/.test(e.message)) throw e;
      throw new Error('Couldn’t reach GitHub. Check the internet connection and try again.');
    });
  }
  function publish(path, obj, message) {
    if (!connected()) return Promise.resolve('local');
    return ghPut(path, obj, message).then(function () { return 'github'; });
  }
  function doneToast(where, what) {
    A.toast(where === 'github' ? what + '. Phones update within about 2 minutes.' : 'Saved on this phone only. Connect GitHub in Setup to reach everyone.', 4200);
  }
  function setBusy(on, label) {
    busy = on;
    Array.prototype.forEach.call(document.querySelectorAll('[data-adm-busy]'), function (b) {
      b.disabled = on;
      if (on) { b.setAttribute('data-label', b.innerHTML); b.textContent = label || 'Publishing…'; }
      else if (b.getAttribute('data-label')) { b.innerHTML = b.getAttribute('data-label'); }
    });
  }
  function fail(e) { setBusy(false); A.toast(e.message || 'Something went wrong', 5000); }

  /* ---------- drafts ---------- */
  function liveNow() { return A.getLive(); }
  function draft() { return store.get('flc.admin.draft', null) || A.clone(liveNow().agenda); }
  function saveDraft(d) { store.set('flc.admin.draft', d); }
  function changeCount(d) {
    var a = d || draft(), b = liveNow().agenda, n = 0, ids = {};
    Object.keys(a.overrides).concat(Object.keys(b.overrides)).forEach(function (k) { ids[k] = 1; });
    Object.keys(ids).forEach(function (k) { if (JSON.stringify(a.overrides[k] || null) !== JSON.stringify(b.overrides[k] || null)) n++; });
    var aa = {}, bb = {};
    a.added.forEach(function (x) { aa[x.id] = JSON.stringify(x); }); b.added.forEach(function (x) { bb[x.id] = JSON.stringify(x); });
    Object.keys(Object.assign({}, aa, bb)).forEach(function (k) { if (aa[k] !== bb[k]) n++; });
    return n;
  }
  function attDraft() { return store.get('flc.admin.attDraft', null); }
  function attPeople() { var d = attDraft(); return d ? d : A.getAttendees().people; }

  /* ---------- helpers ---------- */
  function hint(t) { return '<p class="field__hint">' + t + '</p>'; }
  function eventDateKey(d) { try { return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: D.event.tz }).format(d); } catch (e) { return d.toISOString().slice(0, 10); } }
  function sessionOptions(sel) {
    return '<option value="">None</option>' + D.days.map(function (day) {
      return '<optgroup label="' + esc(day.label + ' · ' + A.shortDay(day)) + '">' + A.allSessions().filter(function (x) { return x.day === day && +x.s.dur; }).map(function (x) {
        return '<option value="' + esc(x.id) + '"' + (sel === x.id ? ' selected' : '') + '>' + esc(x.s.start + ' · ' + x.s.title) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');
  }

  /* =====================================================================
     VIEWS
     ===================================================================== */
  function view(sub) {
    tab = ['notices', 'agenda', 'people', 'setup'].indexOf(sub) > -1 ? sub : 'notices';
    var g = gh(), on = connected();
    var head = '<section class="admin-hero"><p class="eyebrow" style="color:var(--green)">Admin</p><h1>Conference control</h1>' +
      '<p>Send notices, change the agenda and keep the attendee list up to date.</p>' +
      (on ? '<span class="status-pill status-pill--ok">' + icon('check', 'icon--xs') + 'Publishing to ' + esc(g.owner + '/' + g.repo + (g.folder ? '/' + g.folder : '') + ' · ' + g.branch) + '</span>'
          : '<span class="status-pill status-pill--off">' + icon('alert', 'icon--xs') + 'Not connected · changes stay on this phone</span>') + '</section>';
    var tabs = [['notices', 'Notices'], ['agenda', 'Agenda'], ['people', 'Attendees'], ['setup', 'Setup']];
    var seg = '<div style="padding-top:14px"><div class="seg seg--wide" role="group" aria-label="Admin sections">' + tabs.map(function (t) { return '<button type="button" data-adm-tab="' + t[0] + '" aria-pressed="' + (tab === t[0]) + '">' + t[1] + '</button>'; }).join('') + '</div></div>';
    var body = tab === 'agenda' ? viewAgenda() : tab === 'people' ? viewPeople() : tab === 'setup' ? viewSetup() : viewNotices();
    return head + seg + '<div class="stack">' + body + '</div>' + A.foot();
  }

  /* ---------- Notices ---------- */
  function viewNotices() {
    var all = liveNow().notices.slice().sort(function (a, b) { return Date.parse(b.created) - Date.parse(a.created); });
    var act = A.activeNotices(), ended = all.filter(function (x) { return act.indexOf(x) < 0; });
    function item(x, active) {
      var lv = x.level === 'urgent' ? 'Urgent' : x.level === 'important' ? 'Important' : 'Update';
      return '<div class="mini-row" style="grid-template-columns:minmax(0,1fr) auto"><div><p class="mini-row__title">' + esc(x.text) + '</p><p class="mini-row__sub">' + lv + ' · sent ' + A.fmtE.format(new Date(x.created)) +
        (x.expires ? ' · ' + (active ? 'until ' : 'ended ') + A.fmtE.format(new Date(x.expires)) : '') + '</p></div>' +
        (active ? '<button type="button" class="btn btn--line btn--xs" data-adm-end="' + esc(x.id) + '" data-adm-busy>End now</button>' : '') + '</div>';
    }
    return '<section class="panel"><div class="panel__head"><p class="panel__title">Send a notice</p>' + icon('megaphone') + '</div>' +
      '<form class="login__form" data-adm-form="notice" novalidate>' +
      '<label class="field" for="adm-msg"><span class="field__label">Message</span><textarea id="adm-msg" maxlength="220" required placeholder="e.g. Lunch has moved to Flint, Level 2."></textarea>' + hint('Shown at the top of every screen. One or two short sentences work best.') + '</label>' +
      '<div class="field"><span class="field__label">Type</span><div class="level-pick">' +
      '<label class="lv-info"><input type="radio" name="adm-level" value="info" checked><span>Update</span></label>' +
      '<label class="lv-important"><input type="radio" name="adm-level" value="important"><span>Important</span></label>' +
      '<label class="lv-urgent"><input type="radio" name="adm-level" value="urgent"><span>Urgent</span></label></div></div>' +
      '<div class="grid-2"><label class="field" for="adm-exp"><span class="field__label">Show for</span><select id="adm-exp"><option value="60">1 hour</option><option value="120" selected>2 hours</option><option value="240">4 hours</option><option value="eod">Rest of today</option><option value="end">Until the conference ends</option></select></label>' +
      '<label class="field" for="adm-sess"><span class="field__label">Link a session</span><select id="adm-sess">' + sessionOptions('') + '</select></label></div>' +
      '<button type="submit" class="btn btn--primary btn--block" data-adm-busy>' + icon('megaphone', 'icon--sm') + 'Send to everyone</button>' +
      hint(connected() ? 'Open phones show it within about 2 minutes: GitHub takes about a minute to update, and phones check every ' + (A.SET.pollSeconds || 60) + ' seconds.' : 'Not connected to GitHub yet, so only this phone will see it. Set up publishing in the Setup tab.') +
      '</form></section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Showing now</h2><span class="eyebrow eyebrow--muted">' + act.length + '</span></div><div class="pad">' +
      (act.length ? '<div class="mini-rows">' + act.map(function (x) { return item(x, true); }).join('') + '</div>' : '<p class="muted" style="font-size:15px">No active notices.</p>') + '</div></section>' +
      (ended.length ? '<section class="section"><div class="section__head"><h2 class="section__title">Ended</h2><button type="button" class="section__link" data-adm-clear data-adm-busy>Clear all</button></div><div class="pad"><div class="mini-rows">' + ended.slice(0, 8).map(function (x) { return item(x, false); }).join('') + '</div></div></section>' : '');
  }

  /* ---------- Agenda ---------- */
  function viewAgenda() {
    var d = draft(), list = A.buildSessions(d).filter(function (x) { return x.day.id === agDay; }), n = changeCount(d);
    return '<div class="filters" role="group" aria-label="Day">' + D.days.map(function (day) { return '<button type="button" class="filter" data-adm-day="' + day.id + '" aria-pressed="' + (day.id === agDay) + '">' + esc(day.label + ' · ' + day.weekday + ' ' + day.day) + '</button>'; }).join('') + '</div>' +
      '<section class="section" style="gap:6px"><div class="pad"><p class="panel__note">Tap a session to change its time, room, title or presenters, or to cancel it. Changes stay as a draft until you publish. Attendees see an “Updated” tag on changed sessions.</p></div>' +
      '<div class="pad"><div class="mini-rows">' + list.map(function (x) {
        var s = x.s, tag = s.cancelled ? '<span class="chip chip--red">Cancelled</span>' : x.added ? '<span class="chip chip--amber">New</span>' : x.changed ? '<span class="chip chip--amber">Edited</span>' : '';
        return '<button type="button" class="mini-row" data-adm-sess="' + esc(x.id) + '"><span class="mini-row__time">' + esc(s.start) + '</span><span style="min-width:0"><span class="mini-row__title" style="display:block">' + esc(s.title) + '</span><span class="mini-row__sub">' + esc(A.venueLabel(s.venue)) + (+s.dur ? ' · ' + A.durLabel(s.dur) : '') + '</span></span><span style="display:flex;gap:6px;align-items:center">' + tag + icon('edit', 'icon--sm') + '</span></button>';
      }).join('') + '</div></div>' +
      '<div class="pad"><button type="button" class="btn btn--soft btn--block" data-adm-add>' + icon('plus', 'icon--sm') + 'Add a session to ' + esc(D.days.filter(function (x) { return x.id === agDay; })[0].label) + '</button></div></section>' +
      (n ? '<div class="publish-bar"><span>' + n + ' unpublished change' + (n === 1 ? '' : 's') + '</span><span style="display:flex;gap:6px"><button type="button" class="btn btn--xs" style="background:transparent;color:#fff" data-adm-discard>Discard</button><button type="button" class="btn btn--xs" data-adm-pub-agenda data-adm-busy>Publish</button></span></div>' : '');
  }
  var TYPES = [['talk', 'Talk'], ['panel', 'Panel / Q&A'], ['break', 'Break'], ['meal', 'Meal'], ['offsite', 'Off-site'], ['social', 'Evening / social'], ['logistics', 'Logistics']];
  function editor(id) {
    var d = draft(), x = id ? A.buildSessions(d).filter(function (y) { return y.id === id; })[0] : null;
    var s = x ? x.s : { start: '09:00', dur: 30, title: '', sub: '', venue: 'junior', who: [], type: 'talk' };
    var isNew = !x, added = x && x.added, base = x && x.base;
    A.openSheet('<p class="eyebrow">' + (isNew ? 'New session · ' + esc(agDay.replace('d', 'Day ')) : 'Edit session') + '</p><h2 class="sd__title" id="sheet-title">' + (isNew ? 'Add a session' : esc(s.title)) + '</h2>' +
      '<form class="login__form" data-adm-form="session" novalidate><input type="hidden" id="adm-sid" value="' + esc(id || '') + '">' +
      '<label class="field" for="adm-title"><span class="field__label">Title</span><input id="adm-title" value="' + esc(s.title) + '" required></label>' +
      '<label class="field" for="adm-sub"><span class="field__label">Subtitle (optional)</span><input id="adm-sub" value="' + esc(s.sub || '') + '"></label>' +
      '<div class="grid-2"><label class="field" for="adm-start"><span class="field__label">Start (Shanghai)</span><input id="adm-start" type="time" value="' + esc(s.start) + '" required></label>' +
      '<label class="field" for="adm-dur"><span class="field__label">Minutes</span><input id="adm-dur" type="number" min="0" step="5" inputmode="numeric" value="' + esc(s.dur) + '"></label></div>' +
      '<label class="field" for="adm-venue"><span class="field__label">Room</span><select id="adm-venue">' + Object.keys(D.venues).map(function (k) { var v = D.venues[k]; return '<option value="' + k + '"' + (s.venue === k ? ' selected' : '') + '>' + esc(v.name + (v.floor ? ' · ' + v.floor : '')) + '</option>'; }).join('') + '</select></label>' +
      '<label class="field" for="adm-who"><span class="field__label">Presenters</span><input id="adm-who" value="' + esc((Array.isArray(s.who) ? s.who : []).join(', ')) + '" placeholder="Separate names with commas">' + hint('Use the same names as the agenda, e.g. Robert, Hafed Belhadj.') + '</label>' +
      '<label class="field" for="adm-type"><span class="field__label">Type</span><select id="adm-type">' + TYPES.map(function (t) { return '<option value="' + t[0] + '"' + (s.type === t[0] ? ' selected' : '') + '>' + t[1] + '</option>'; }).join('') + '</select></label>' +
      '<label class="check" for="adm-cancel"><input id="adm-cancel" type="checkbox"' + (s.cancelled ? ' checked' : '') + '>Mark as cancelled</label>' +
      '<button type="submit" class="btn btn--primary btn--block">' + icon('check', 'icon--sm') + (isNew ? 'Add to draft' : 'Save to draft') + '</button>' +
      (x && x.changed && base ? '<button type="button" class="btn btn--line btn--block" data-adm-restore="' + esc(id) + '">Restore the booklet version</button>' : '') +
      (added ? '<button type="button" class="btn btn--danger btn--block" data-adm-remove="' + esc(id) + '">' + icon('trash', 'icon--sm') + 'Delete this session</button>' : '') +
      (base ? hint('Booklet version: ' + esc(base.start + ' · ' + base.title + ' · ' + A.venueLabel(base.venue))) : '') + '</form>');
  }
  function saveSession() {
    var id = document.getElementById('adm-sid').value;
    var f = {
      title: document.getElementById('adm-title').value.trim(),
      sub: document.getElementById('adm-sub').value.trim(),
      start: document.getElementById('adm-start').value || '09:00',
      dur: Math.max(0, parseInt(document.getElementById('adm-dur').value, 10) || 0),
      venue: document.getElementById('adm-venue').value,
      who: document.getElementById('adm-who').value.split(',').map(function (w) { return w.trim(); }).filter(Boolean),
      type: document.getElementById('adm-type').value,
      cancelled: document.getElementById('adm-cancel').checked
    };
    if (!f.title) { A.toast('Add a title for the session'); return; }
    var d = draft();
    if (!id) {
      f.id = 'x' + Date.now().toString(36); f.day = agDay;
      if (!f.sub) delete f.sub; if (!f.cancelled) delete f.cancelled;
      d.added.push(f);
    } else if (id.charAt(0) === 'x') {
      d.added = d.added.map(function (a) { return a.id === id ? Object.assign({ id: id, day: a.day }, f) : a; });
    } else {
      var p = id.split('-'), day = D.days.filter(function (x) { return x.id === p[0]; })[0], base = day.sessions[+p[1]], o = {};
      ['title', 'start', 'dur', 'venue', 'type'].forEach(function (k) { if (String(base[k]) !== String(f[k])) o[k] = f[k]; });
      if ((base.sub || '') !== f.sub) o.sub = f.sub;
      if (JSON.stringify(base.who || []) !== JSON.stringify(f.who)) o.who = f.who;
      if (f.cancelled) o.cancelled = true;
      if (Object.keys(o).length) d.overrides[id] = o; else delete d.overrides[id];
    }
    saveDraft(d); A.closeSheet(); A.rerender(); A.toast('Saved to draft. Publish when you’re ready.');
  }
  function publishAgenda() {
    if (busy) return;
    var l = A.clone(liveNow()); l.agenda = draft(); l.updated = new Date().toISOString();
    setBusy(true);
    publish('data/live.json', l, 'Agenda update from Admin').then(function (where) {
      setBusy(false); store.del('flc.admin.draft'); A.setLive(l); doneToast(where, 'Agenda published');
    }, fail);
  }

  /* ---------- Attendees ---------- */
  function parseList(text) {
    var rows = text.split(/\r?\n/).map(function (l) { return l.replace(/\s+$/, ''); }).filter(function (l) { return l.trim(); });
    function cells(line) {
      if (line.indexOf('\t') > -1) return line.split('\t').map(function (c) { return c.trim(); });
      var out = [], cur = '', q = false;
      for (var i = 0; i < line.length; i++) {
        var ch = line[i];
        if (ch === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++; } else q = !q; }
        else if (ch === ',' && !q) { out.push(cur.trim()); cur = ''; }
        else cur += ch;
      }
      out.push(cur.trim()); return out;
    }
    var data = rows.map(cells);
    if (data.length && /^name$|full name|attendee/i.test(data[0][0] || '')) data.shift();
    return data.filter(function (c) { return c[0]; }).map(function (c) { return { name: c[0], title: c[1] || '', company: c[2] || '', region: c[3] || '' }; });
  }
  function table(people, removable) {
    return '<div class="table-wrap"><table><thead><tr><th>Name</th><th>Job title</th><th>Company</th><th>Region</th>' + (removable ? '<th></th>' : '') + '</tr></thead><tbody>' +
      people.map(function (p, i) { return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.title) + '</td><td>' + esc(p.company) + '</td><td>' + esc(p.region) + '</td>' + (removable ? '<td><button type="button" class="icon-btn" style="width:32px;height:32px" data-adm-rm="' + i + '" aria-label="Remove ' + esc(p.name) + '">' + icon('trash', 'icon--xs') + '</button></td>' : '') + '</tr>'; }).join('') +
      '</tbody></table></div>';
  }
  function viewPeople() {
    var att = A.getAttendees(), people = attPeople(), dirty = attDraft() !== null;
    var q = attFilter.toLowerCase(), shown = people.map(function (p, i) { return { p: p, i: i }; }).filter(function (o) { return !q || (o.p.name + ' ' + o.p.company + ' ' + o.p.region).toLowerCase().indexOf(q) > -1; });
    return '<section class="panel"><div class="panel__head"><p class="panel__title">Import from Excel</p>' + icon('upload') + '</div>' +
      '<ol class="steps"><li>In Excel, put the columns in this order: <b>Name, Job title, Company, Region</b>.</li><li>Select the rows (with or without the header) and copy.</li><li>Paste below and check the preview.</li></ol>' +
      '<label class="field" for="adm-paste"><span class="field__label">Paste here</span><textarea id="adm-paste" placeholder="Name	Job title	Company	Region"></textarea></label>' +
      '<button type="button" class="btn btn--soft btn--block" data-adm-parse>Preview</button>' +
      (parsed ? (parsed.length ? '<p class="panel__note"><b>' + parsed.length + ' people</b> found. First rows:</p>' + table(parsed.slice(0, 6), false) +
        '<div class="grid-2"><button type="button" class="btn btn--primary btn--sm" data-adm-import="replace" data-adm-busy>Replace list</button><button type="button" class="btn btn--line btn--sm" data-adm-import="add" data-adm-busy>Add to list</button></div>' + hint('Both options publish straight away.')
        : '<p class="login__error">No names found. Check that the name is in the first column.</p>') : '') + '</section>' +
      '<section class="section"><div class="section__head"><h2 class="section__title">Current list</h2><span class="eyebrow eyebrow--muted">' + people.length + ' people</span></div>' +
      (att.note && !dirty ? '<p class="pad panel__note">' + esc(att.note) + '</p>' : '') +
      '<label class="search" for="adm-att-q">' + icon('search', 'icon--sm') + '<input id="adm-att-q" type="search" placeholder="Find someone to remove" value="' + esc(attFilter) + '"></label>' +
      '<div class="pad" id="adm-att-table">' + tableFor(shown) + '</div></section>' +
      (dirty ? '<div class="publish-bar"><span>Attendee list changed</span><span style="display:flex;gap:6px"><button type="button" class="btn btn--xs" style="background:transparent;color:#fff" data-adm-att-discard>Discard</button><button type="button" class="btn btn--xs" data-adm-att-pub data-adm-busy>Publish</button></span></div>' : '');
  }
  function tableFor(shown) {
    if (!shown.length) return '<p class="muted" style="font-size:15px">No one matches.</p>';
    return '<div class="table-wrap"><table><thead><tr><th>Name</th><th>Job title</th><th>Company</th><th>Region</th><th></th></tr></thead><tbody>' +
      shown.map(function (o) { var p = o.p; return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.title) + '</td><td>' + esc(p.company) + '</td><td>' + esc(p.region) + '</td><td><button type="button" class="icon-btn" style="width:32px;height:32px" data-adm-rm="' + o.i + '" aria-label="Remove ' + esc(p.name) + '">' + icon('trash', 'icon--xs') + '</button></td></tr>'; }).join('') +
      '</tbody></table></div>';
  }
  function publishAttendees(people, label) {
    if (busy) return;
    var obj = { updated: new Date().toISOString(), people: people };
    setBusy(true);
    publish('data/attendees.json', obj, 'Attendee list update from Admin').then(function (where) {
      setBusy(false); store.del('flc.admin.attDraft'); parsed = null; A.setAttendees(obj); A.rerender(); doneToast(where, (label || 'Attendee list') + ' published');
    }, fail);
  }

  /* ---------- Setup ---------- */
  function viewSetup() {
    var g = gh(), l = liveNow(), at = A.getAttendees();
    return '<section class="panel"><div class="panel__head"><p class="panel__title">Publish to everyone</p>' + icon('link') + '</div>' +
      '<p class="panel__note">The app lives in your GitHub repository. To publish from this page, paste a GitHub access token once. It is saved only on this phone and is never added to the website.</p>' +
      '<form class="login__form" data-adm-form="gh" novalidate>' +
      '<div class="grid-2"><label class="field" for="adm-owner"><span class="field__label">GitHub user</span><input id="adm-owner" value="' + esc(g.owner) + '" autocapitalize="off" spellcheck="false" placeholder="your-username"></label>' +
      '<label class="field" for="adm-repo"><span class="field__label">Repository</span><input id="adm-repo" value="' + esc(g.repo) + '" autocapitalize="off" spellcheck="false" placeholder="flc-2027"></label></div>' +
      '<div class="grid-2"><label class="field" for="adm-branch"><span class="field__label">Branch</span><input id="adm-branch" value="' + esc(g.branch) + '" autocapitalize="off" spellcheck="false"></label>' +
      '<label class="field" for="adm-folder"><span class="field__label">App folder</span><input id="adm-folder" value="' + esc(g.folder) + '" autocapitalize="off" spellcheck="false" placeholder="(repository root)"></label></div>' +
      '<label class="field" for="adm-token"><span class="field__label">Access token</span><input id="adm-token" type="password" value="' + esc(g.token) + '" autocapitalize="off" spellcheck="false" placeholder="github_pat_…"></label>' +
      '<button type="submit" class="btn btn--primary btn--block" data-adm-busy>Save and test</button>' +
      (g.token ? '<button type="button" class="btn btn--line btn--block" data-adm-forget>Remove token from this phone</button>' : '') + '</form>' +
      '<p class="panel__title" style="font-size:16px;margin-top:4px">Create the token (once)</p>' +
      '<ol class="steps"><li>On github.com, open your profile picture → <b>Settings</b> → <b>Developer settings</b> → <b>Personal access tokens</b> → <b>Fine-grained tokens</b>.</li>' +
      '<li>Choose <b>Generate new token</b>. Name it “FLC admin” and set an expiry after the conference.</li>' +
      '<li>Under <b>Repository access</b>, choose <b>Only select repositories</b> and pick this app’s repository.</li>' +
      '<li>Under <b>Permissions → Repository permissions</b>, set <b>Contents</b> to <b>Read and write</b>.</li>' +
      '<li>Generate, copy the token, paste it above and tap <b>Save and test</b>.</li></ol></section>' +
      '<section class="panel"><div class="panel__head"><p class="panel__title">How updates reach phones</p>' + icon('bell') + '</div>' +
      '<ul class="steps"><li>Publishing saves the change in GitHub. The site updates in about a minute.</li><li>Open phones check every ' + (A.SET.pollSeconds || 60) + ' seconds and show new notices at the top of the screen.</li>' +
      '<li>People who tapped “Alert me” also get a phone alert while the app is open or in the background. Nothing can reach a phone where the app is closed, so keep important messages on your usual chat group too.</li></ul></section>' +
      '<section class="panel"><div class="panel__head"><p class="panel__title">Backup and manual upload</p>' + icon('copy') + '</div>' +
      '<p class="panel__note">If the token isn’t available, copy or download a file and upload it to the <span class="code">data</span> folder in GitHub, replacing the old one.</p>' +
      '<div class="grid-2"><button type="button" class="btn btn--line btn--sm" data-adm-copy="live">Copy live.json</button><button type="button" class="btn btn--line btn--sm" data-adm-dl="live">Download live.json</button>' +
      '<button type="button" class="btn btn--line btn--sm" data-adm-copy="att">Copy attendees.json</button><button type="button" class="btn btn--line btn--sm" data-adm-dl="att">Download attendees.json</button></div>' +
      hint('Live data last updated ' + esc(new Date(l.updated).toLocaleString()) + ' · attendees ' + esc(new Date(at.updated).toLocaleString())) + '</section>';
  }
  function fileText(which) { return JSON.stringify(which === 'att' ? A.getAttendees() : liveNow(), null, 2) + '\n'; }
  function download(which) {
    try {
      var blob = new Blob([fileText(which)], { type: 'application/json' }), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = which === 'att' ? 'attendees.json' : 'live.json';
      document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    } catch (e) { A.toast('Download isn’t available here. Use Copy instead.'); }
  }
  function saveGh() {
    var c = {
      owner: document.getElementById('adm-owner').value.trim(), repo: document.getElementById('adm-repo').value.trim(),
      branch: document.getElementById('adm-branch').value.trim() || 'main', folder: document.getElementById('adm-folder').value.trim(), token: document.getElementById('adm-token').value.trim()
    };
    store.set('flc.admin.gh', c);
    if (!c.token || !c.owner || !c.repo) { A.rerender(); A.toast('Saved. Add the user, repository and token to publish.'); return; }
    setBusy(true, 'Testing…');
    api('').then(function (r) {
      if (!r.ok) throw new Error(explain(r.status));
      return r.json();
    }).then(function (j) {
      setBusy(false); A.rerender();
      A.toast(j.permissions && j.permissions.push === false ? 'Connected, but the token can’t write. Set Contents to Read and write.' : 'Connected to ' + c.owner + '/' + c.repo + '. You can publish now.', 4500);
    }).catch(function (e) { setBusy(false); A.rerender(); A.toast(/GitHub|Repository|token/.test(e.message) ? e.message : 'Couldn’t reach GitHub. Check the connection and try again.', 5000); });
  }

  /* =====================================================================
     EVENTS
     ===================================================================== */
  function onClick(e, t) {
    var el;
    if ((el = t.closest('[data-adm-edit]'))) { var id = el.getAttribute('data-adm-edit'); A.closeSheet(); agDay = id.charAt(0) === 'x' ? (draft().added.filter(function (a) { return a.id === id; })[0] || {}).day || agDay : id.split('-')[0]; A.replaceRoute('admin/agenda'); editor(id); return true; }
    if ((el = t.closest('[data-adm-tab]'))) { A.replaceRoute('admin/' + el.getAttribute('data-adm-tab')); return true; }
    if ((el = t.closest('[data-adm-day]'))) { agDay = el.getAttribute('data-adm-day'); A.rerender(); return true; }
    if ((el = t.closest('[data-adm-sess]'))) { editor(el.getAttribute('data-adm-sess')); return true; }
    if ((el = t.closest('[data-adm-add]'))) { editor(null); return true; }
    if ((el = t.closest('[data-adm-restore]'))) { var d = draft(); delete d.overrides[el.getAttribute('data-adm-restore')]; saveDraft(d); A.closeSheet(); A.rerender(); A.toast('Restored to the booklet version (draft)'); return true; }
    if ((el = t.closest('[data-adm-remove]'))) { var d2 = draft(), rid = el.getAttribute('data-adm-remove'); d2.added = d2.added.filter(function (a) { return a.id !== rid; }); saveDraft(d2); A.closeSheet(); A.rerender(); A.toast('Session removed from draft'); return true; }
    if ((el = t.closest('[data-adm-discard]'))) { store.del('flc.admin.draft'); A.rerender(); A.toast('Draft discarded'); return true; }
    if ((el = t.closest('[data-adm-pub-agenda]'))) { publishAgenda(); return true; }
    if ((el = t.closest('[data-adm-end]'))) {
      if (busy) return true;
      var nid = el.getAttribute('data-adm-end'), l = A.clone(liveNow());
      l.notices = l.notices.map(function (n) { return n.id === nid ? Object.assign({}, n, { expires: A.now().toISOString() }) : n; }); l.updated = new Date().toISOString();
      setBusy(true); publish('data/live.json', l, 'End notice').then(function (w) { setBusy(false); A.setLive(l); doneToast(w, 'Notice ended'); }, fail); return true;
    }
    if ((el = t.closest('[data-adm-clear]'))) {
      if (busy) return true;
      var act = A.activeNotices().map(function (n) { return n.id; }), l2 = A.clone(liveNow());
      l2.notices = l2.notices.filter(function (n) { return act.indexOf(n.id) > -1; }); l2.updated = new Date().toISOString();
      setBusy(true); publish('data/live.json', l2, 'Clear ended notices').then(function (w) { setBusy(false); A.setLive(l2); doneToast(w, 'Ended notices cleared'); }, fail); return true;
    }
    if ((el = t.closest('[data-adm-parse]'))) { parsed = parseList(document.getElementById('adm-paste').value); var keep = document.getElementById('adm-paste').value; A.rerender(); document.getElementById('adm-paste').value = keep; return true; }
    if ((el = t.closest('[data-adm-import]'))) {
      if (!parsed || !parsed.length) return true;
      var mode = el.getAttribute('data-adm-import'), base = attPeople(), names = {};
      var next = mode === 'replace' ? parsed : base.concat(parsed.filter(function (p) { var k = p.name.toLowerCase(); if (names[k]) return false; names[k] = 1; return !base.some(function (b) { return b.name.toLowerCase() === k; }); }));
      publishAttendees(next, mode === 'replace' ? 'New attendee list (' + next.length + ')' : parsed.length + ' attendees');
      return true;
    }
    if ((el = t.closest('[data-adm-rm]'))) { var ppl = attPeople().slice(); ppl.splice(+el.getAttribute('data-adm-rm'), 1); store.set('flc.admin.attDraft', ppl); A.rerender(); return true; }
    if ((el = t.closest('[data-adm-att-discard]'))) { store.del('flc.admin.attDraft'); A.rerender(); return true; }
    if ((el = t.closest('[data-adm-att-pub]'))) { publishAttendees(attPeople()); return true; }
    if ((el = t.closest('[data-adm-forget]'))) { var c = store.get('flc.admin.gh', {}); delete c.token; store.set('flc.admin.gh', c); A.rerender(); A.toast('Token removed from this phone'); return true; }
    if ((el = t.closest('[data-adm-copy]'))) { A.copy(fileText(el.getAttribute('data-adm-copy')), el.getAttribute('data-adm-copy') === 'att' ? 'attendees.json' : 'live.json'); return true; }
    if ((el = t.closest('[data-adm-dl]'))) { download(el.getAttribute('data-adm-dl')); return true; }
    return false;
  }
  document.addEventListener('submit', function (e) {
    var f = e.target.closest && e.target.closest('[data-adm-form]');
    if (!f) return;
    e.preventDefault();
    var kind = f.getAttribute('data-adm-form');
    if (kind === 'session') return saveSession();
    if (kind === 'gh') return saveGh();
    if (kind === 'notice') {
      if (busy) return;
      var text = document.getElementById('adm-msg').value.trim();
      if (!text) { A.toast('Write a message first'); return; }
      var lv = (f.querySelector('input[name="adm-level"]:checked') || {}).value || 'info';
      var exp = document.getElementById('adm-exp').value, nowD = A.now(), expires;
      if (exp === 'eod') expires = new Date(eventDateKey(nowD) + 'T23:59:00' + D.event.utcOffset).toISOString();
      else if (exp === 'end') expires = new Date(D.event.end).toISOString();
      else expires = new Date(nowD.getTime() + (+exp) * 60000).toISOString();
      var n = { id: 'n' + Date.now().toString(36), text: text, level: lv, created: nowD.toISOString(), expires: expires };
      var sess = document.getElementById('adm-sess').value; if (sess) n.session = sess;
      var l = A.clone(liveNow()); l.notices.unshift(n); l.updated = new Date().toISOString();
      store.set('flc.seenNotices', store.get('flc.seenNotices', []).concat([n.id]));
      setBusy(true);
      publish('data/live.json', l, 'Notice: ' + text.slice(0, 60)).then(function (w) { setBusy(false); A.setLive(l); doneToast(w, 'Notice sent'); }, fail);
    }
  });
  document.addEventListener('input', function (e) {
    if (e.target.id === 'adm-att-q') {
      attFilter = e.target.value; var q = attFilter.toLowerCase();
      var shown = attPeople().map(function (p, i) { return { p: p, i: i }; }).filter(function (o) { return !q || (o.p.name + ' ' + o.p.company + ' ' + o.p.region).toLowerCase().indexOf(q) > -1; });
      document.getElementById('adm-att-table').innerHTML = tableFor(shown);
    }
  });

  return { view: view, onClick: onClick };
};

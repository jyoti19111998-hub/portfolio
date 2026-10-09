/**
 * Nutriment Properties – free automation backend (Google Sheets + Apps Script)
 *
 * What it does
 *  1. Receives leads from the website chat box (doPost) -> "Leads" sheet
 *     - emails the agent instantly (with a one-tap WhatsApp link to the client)
 *     - emails the client an automatic "thank you / next steps" reply
 *  2. Every morning (daily trigger):
 *     - reminds clients who have a viewing TOMORROW ("Viewings" sheet)
 *     - reminds tenants before / on / after their rent due date ("Tenants" sheet)
 *     - sends the agent a digest with one-tap WhatsApp links for every reminder
 *  3. Generates ready-to-post social media captions for new listings ("Listings" sheet)
 *
 * Setup: see ../README.md. In short: paste this file into Extensions > Apps Script
 * of a new Google Sheet, edit CONFIG, run setup() once, then Deploy > Web app.
 */

const CONFIG = {
  BUSINESS_NAME: 'Nutriment Properties',
  AGENT_EMAIL: 'CHANGE_ME@example.com',      // where new-lead alerts and the daily digest go
  WHATSAPP_NUMBER: '66XXXXXXXXX',            // business WhatsApp, international format, digits only
  WEBSITE_URL: 'https://www.nutriment-properties.com',
  TIMEZONE: 'Asia/Bangkok',
  DAILY_RUN_HOUR: 9,                         // reminders go out around 09:00 Bangkok time
  RENT_REMINDER_DAYS_BEFORE: 3,              // first rent reminder N days before due date
  OVERDUE_REMINDER_EVERY_DAYS: 3,            // repeat overdue reminders every N days
  SEND_EMAILS_TO_CLIENTS: true,              // false = only the agent digest is sent (safe testing)
};

const SHEETS = {
  LEADS: 'Leads',
  VIEWINGS: 'Viewings',
  TENANTS: 'Tenants',
  LISTINGS: 'Listings',
  LOG: 'Log',
};

const HEADERS = {
  Leads: ['Received', 'Name', 'Email', 'WhatsApp', 'Country', 'Interest', 'Property Type',
    'Bedrooms', 'Budget', 'Timeline', 'Message', 'Page', 'Status', 'Notes'],
  Viewings: ['Client Name', 'Email', 'WhatsApp', 'Property', 'Viewing Date', 'Time',
    'Agent', 'Status', 'Reminder Sent'],
  Tenants: ['Tenant Name', 'Email', 'WhatsApp', 'Property', 'Monthly Rent', 'Currency',
    'Due Day (1-31)', 'Paid For (YYYY-MM)', 'Last Reminder'],
  Listings: ['ID', 'Title', 'Deal (Rent/Sale/Lease)', 'Type', 'Location', 'Bedrooms', 'Price',
    'Currency', 'Highlights', 'Photo URL', 'Listing URL', 'Status', 'Social Caption'],
  Log: ['Time', 'Action', 'Details'],
};

/* ------------------------------------------------------------------ */
/* One-time setup                                                      */
/* ------------------------------------------------------------------ */

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone(CONFIG.TIMEZONE);
  Object.keys(HEADERS).forEach(function (name) {
    const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[name]);
      sheet.getRange(1, 1, 1, HEADERS[name].length).setFontWeight('bold').setBackground('#f1f3f4');
      sheet.setFrozenRows(1);
    }
  });
  const status = ss.getSheetByName(SHEETS.LEADS).getRange('M2:M');
  status.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireValueInList(['New', 'Contacted', 'Viewing booked', 'Negotiating', 'Closed - won', 'Closed - lost'])
    .build());
  ss.getSheetByName(SHEETS.VIEWINGS).getRange('E2:E').setNumberFormat('dd mmm yyyy');

  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'runDailyReminders'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('runDailyReminders').timeBased()
    .everyDays(1).atHour(CONFIG.DAILY_RUN_HOUR).inTimezone(CONFIG.TIMEZONE).create();

  log_('setup', 'Sheets and daily trigger created');
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu(CONFIG.BUSINESS_NAME)
    .addItem('Run reminders now', 'runDailyReminders')
    .addItem('Generate social captions', 'generateSocialCaptions')
    .addItem('Send test lead', 'sendTestLead')
    .addSeparator()
    .addItem('Re-run setup', 'setup')
    .addToUi();
}

/* ------------------------------------------------------------------ */
/* 1. Lead capture (website chat box posts here)                       */
/* ------------------------------------------------------------------ */

function doGet() {
  return json_({ ok: true, service: CONFIG.BUSINESS_NAME + ' lead endpoint' });
}

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (data.website) return json_({ ok: true });            // honeypot: bots fill hidden field
    if (!data.name || !(data.email || data.whatsapp)) {
      return json_({ ok: false, error: 'Name and email or WhatsApp are required' });
    }
    const lead = sanitizeLead_(data);
    saveLead_(lead);
    notifyAgentOfLead_(lead);
    if (CONFIG.SEND_EMAILS_TO_CLIENTS && lead.email) autoReplyToLead_(lead);
    return json_({ ok: true });
  } catch (err) {
    log_('doPost error', String(err));
    return json_({ ok: false, error: 'Server error' });
  }
}

function sanitizeLead_(d) {
  const clean = function (v, max) { return String(v || '').replace(/[\r\n]+/g, ' ').trim().slice(0, max || 200); };
  const email = clean(d.email, 120);
  return {
    name: clean(d.name, 80),
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '',
    whatsapp: clean(d.whatsapp, 30).replace(/[^\d+]/g, ''),
    country: clean(d.country, 40),
    interest: clean(d.interest, 60),
    propertyType: clean(d.propertyType, 60),
    bedrooms: clean(d.bedrooms, 20),
    budget: clean(d.budget, 60),
    timeline: clean(d.timeline, 40),
    message: clean(d.message, 1000),
    page: clean(d.page, 300),
  };
}

function saveLead_(l) {
  // A leading quote stops Sheets from treating user text as a formula.
  const safe = function (v) { return /^[=+\-@]/.test(v) ? "'" + v : v; };
  sheet_(SHEETS.LEADS).appendRow([new Date(), safe(l.name), safe(l.email), safe(l.whatsapp),
    safe(l.country), safe(l.interest), safe(l.propertyType), safe(l.bedrooms), safe(l.budget),
    safe(l.timeline), safe(l.message), safe(l.page), 'New', '']);
}

function notifyAgentOfLead_(l) {
  const wa = l.whatsapp ? waLink_(l.whatsapp,
    'Hi ' + l.name + ', this is ' + CONFIG.BUSINESS_NAME + '. Thank you for your enquiry about ' +
    (l.propertyType || l.interest || 'property') + ' in Pattaya. When is a good time to talk?') : '';
  const rows = [['Name', l.name], ['Email', l.email], ['WhatsApp', l.whatsapp], ['Country', l.country],
    ['Interest', l.interest], ['Property type', l.propertyType], ['Bedrooms', l.bedrooms],
    ['Budget', l.budget], ['Timeline', l.timeline], ['Message', l.message], ['Page', l.page]];
  const html = '<h2>New lead: ' + esc_(l.name) + '</h2><table cellpadding="4">' +
    rows.filter(function (r) { return r[1]; })
      .map(function (r) { return '<tr><td><b>' + r[0] + '</b></td><td>' + esc_(r[1]) + '</td></tr>'; }).join('') +
    '</table>' +
    (wa ? '<p><a href="' + wa + '" style="background:#25D366;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Reply on WhatsApp</a></p>' : '') +
    '<p><a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '">Open lead sheet</a></p>';
  MailApp.sendEmail({
    to: CONFIG.AGENT_EMAIL,
    subject: 'New lead – ' + l.name + ' (' + (l.country || 'unknown country') + ', ' + (l.interest || 'enquiry') + ')',
    htmlBody: html,
    replyTo: l.email || CONFIG.AGENT_EMAIL,
  });
}

function autoReplyToLead_(l) {
  const html =
    '<p>Dear ' + esc_(l.name) + ',</p>' +
    '<p>Thank you for contacting <b>' + CONFIG.BUSINESS_NAME + '</b>. We have received your enquiry' +
    (l.interest ? ' about <b>' + esc_(l.interest) + '</b>' : '') + ' and one of our agents will contact you within 24 hours.</p>' +
    '<p>We help with: 1–3 bedroom apartments, pool villas to rent or buy, Airbnb set-up for villas and apartments, ' +
    'commercial property (Walking Street clubs, offices, shops) and hotels for lease or sale – with guidance from start to finish.</p>' +
    '<p>For a faster reply, message us on WhatsApp: <a href="' + waLink_(CONFIG.WHATSAPP_NUMBER, 'Hi, I just sent an enquiry on your website. My name is ' + l.name) + '">chat now</a>.</p>' +
    '<p>Kind regards,<br>' + CONFIG.BUSINESS_NAME + '<br><a href="' + CONFIG.WEBSITE_URL + '">' + CONFIG.WEBSITE_URL + '</a></p>';
  MailApp.sendEmail({
    to: l.email,
    subject: 'Thank you for your enquiry – ' + CONFIG.BUSINESS_NAME,
    htmlBody: html,
    replyTo: CONFIG.AGENT_EMAIL,
    name: CONFIG.BUSINESS_NAME,
  });
}

function sendTestLead() {
  doPost({ postData: { contents: JSON.stringify({
    name: 'Test Client', email: CONFIG.AGENT_EMAIL, whatsapp: '+10000000000', country: 'USA',
    interest: 'Buy', propertyType: 'Pool villa', bedrooms: '3', budget: '10–25M THB',
    timeline: '1–3 months', message: 'This is a test lead', page: 'manual test',
  }) } });
}

/* ------------------------------------------------------------------ */
/* 2. Daily reminders                                                  */
/* ------------------------------------------------------------------ */

function runDailyReminders() {
  const digest = [];
  sendViewingReminders_(digest);
  sendRentReminders_(digest);
  if (digest.length) {
    MailApp.sendEmail({
      to: CONFIG.AGENT_EMAIL,
      subject: CONFIG.BUSINESS_NAME + ' – ' + digest.length + ' reminder(s) today',
      htmlBody: '<h2>Today\'s reminders</h2><p>Emails were sent automatically where an address exists. ' +
        'Tap a button to send the same message on WhatsApp.</p>' + digest.join('<hr>'),
    });
  }
  log_('runDailyReminders', digest.length + ' reminder(s)');
}

function sendViewingReminders_(digest) {
  const sheet = sheet_(SHEETS.VIEWINGS);
  const values = sheet.getDataRange().getValues();
  const tomorrow = dayKey_(addDays_(new Date(), 1));
  for (let i = 1; i < values.length; i++) {
    const [name, email, whatsapp, property, date, time, agent, status, sent] = values[i];
    if (!name || !(date instanceof Date) || sent) continue;
    if (/cancel/i.test(String(status))) continue;
    if (dayKey_(date) !== tomorrow) continue;

    const when = Utilities.formatDate(date, CONFIG.TIMEZONE, 'EEEE d MMMM') + (time ? ' at ' + formatTime_(time) : '');
    const msg = 'Hi ' + name + ', this is a friendly reminder of your property viewing tomorrow, ' + when +
      ' – ' + property + '.' + (agent ? ' Your agent will be ' + agent + '.' : '') +
      ' Please reply to confirm or reschedule. – ' + CONFIG.BUSINESS_NAME;

    if (CONFIG.SEND_EMAILS_TO_CLIENTS && email) {
      MailApp.sendEmail({ to: email, subject: 'Viewing reminder – ' + when, body: msg,
        replyTo: CONFIG.AGENT_EMAIL, name: CONFIG.BUSINESS_NAME });
    }
    sheet.getRange(i + 1, 9).setValue(new Date());
    digest.push(digestItem_('Viewing tomorrow: ' + name + ' – ' + property, msg, whatsapp));
  }
}

function sendRentReminders_(digest) {
  const sheet = sheet_(SHEETS.TENANTS);
  const values = sheet.getDataRange().getValues();
  const today = startOfDay_(new Date());
  const thisMonth = Utilities.formatDate(today, CONFIG.TIMEZONE, 'yyyy-MM');

  for (let i = 1; i < values.length; i++) {
    const [name, email, whatsapp, property, rent, currency, dueDay, paidFor, last] = values[i];
    if (!name || !dueDay) continue;
    if (last instanceof Date && dayKey_(last) === dayKey_(today)) continue;

    // Once this month is paid, look ahead to next month's due date (matters for due days 1-3).
    let due = dueDateInMonth_(today, Number(dueDay), 0);
    let period = thisMonth;
    const nextDue = dueDateInMonth_(today, Number(dueDay), 1);
    if (monthKey_(paidFor) >= thisMonth && (nextDue - today) / 86400000 <= CONFIG.RENT_REMINDER_DAYS_BEFORE) {
      due = nextDue;
      period = Utilities.formatDate(nextDue, CONFIG.TIMEZONE, 'yyyy-MM');
    }
    if (monthKey_(paidFor) >= period) continue;

    const daysToDue = Math.round((due - today) / 86400000);
    let kind = null;
    if (daysToDue === CONFIG.RENT_REMINDER_DAYS_BEFORE) kind = 'upcoming';
    else if (daysToDue === 0) kind = 'today';
    else if (daysToDue < 0 && (-daysToDue) % CONFIG.OVERDUE_REMINDER_EVERY_DAYS === 0) kind = 'overdue';
    if (!kind) continue;

    const amount = (rent ? Number(rent).toLocaleString('en-US') + ' ' + (currency || 'THB') : 'your rent');
    const dueText = Utilities.formatDate(due, CONFIG.TIMEZONE, 'd MMMM yyyy');
    const msg = {
      upcoming: 'Hi ' + name + ', a friendly reminder that rent of ' + amount + ' for ' + property + ' is due on ' + dueText + '.',
      today: 'Hi ' + name + ', rent of ' + amount + ' for ' + property + ' is due today (' + dueText + ').',
      overdue: 'Hi ' + name + ', our records show rent of ' + amount + ' for ' + property + ' (due ' + dueText +
        ') is still outstanding. Please arrange payment or contact us if you have already paid.',
    }[kind] + ' Thank you! – ' + CONFIG.BUSINESS_NAME;

    if (CONFIG.SEND_EMAILS_TO_CLIENTS && email) {
      MailApp.sendEmail({ to: email, subject: 'Rent reminder – ' + property, body: msg,
        replyTo: CONFIG.AGENT_EMAIL, name: CONFIG.BUSINESS_NAME });
    }
    sheet.getRange(i + 1, 9).setValue(new Date());
    digest.push(digestItem_('Rent ' + kind + ': ' + name + ' – ' + property, msg, whatsapp));
  }
}

/* ------------------------------------------------------------------ */
/* 3. Social media captions for listings                               */
/* ------------------------------------------------------------------ */

function generateSocialCaptions() {
  const sheet = sheet_(SHEETS.LISTINGS);
  const values = sheet.getDataRange().getValues();
  let count = 0;
  for (let i = 1; i < values.length; i++) {
    const [id, title, deal, type, location, beds, price, currency, highlights, photo, url, status, caption] = values[i];
    if (!title || caption || /sold|rented|inactive/i.test(String(status))) continue;
    const priceText = price ? Number(price).toLocaleString('en-US') + ' ' + (currency || 'THB') +
      (/rent/i.test(deal) ? ' / month' : '') : 'Price on request';
    const tags = ['#Pattaya', '#PattayaProperty', '#ThailandRealEstate', '#' + String(type || 'Property').replace(/\W+/g, ''),
      /rent/i.test(deal) ? '#PattayaRental' : '#PropertyForSale', '#ExpatLife', '#InvestInThailand'];
    if (/villa/i.test(type)) tags.push('#PoolVilla');
    if (/airbnb/i.test(highlights)) tags.push('#AirbnbInvestment');
    const text = [
      '🏝️ ' + title + (deal ? ' – for ' + String(deal).toLowerCase() : ''),
      '📍 ' + (location || 'Pattaya'),
      beds ? '🛏️ ' + beds + ' bedroom(s)' : null,
      '💰 ' + priceText,
      highlights ? '✨ ' + highlights : null,
      '',
      '📲 WhatsApp: ' + waLink_(CONFIG.WHATSAPP_NUMBER, 'Hi, I am interested in listing ' + (id || title)),
      url ? '🔗 ' + url : null,
      '',
      tags.join(' '),
    ].filter(function (line) { return line !== null; }).join('\n');
    sheet.getRange(i + 1, 13).setValue(text);
    count++;
  }
  log_('generateSocialCaptions', count + ' caption(s)');
  try { SpreadsheetApp.getUi().alert(count + ' caption(s) generated in column M.'); } catch (e) { /* run from trigger */ }
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function sheet_(name) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!s) throw new Error('Sheet "' + name + '" not found – run setup() first');
  return s;
}

function digestItem_(title, msg, whatsapp) {
  return '<p><b>' + esc_(title) + '</b><br>' + esc_(msg) + '</p>' +
    (whatsapp ? '<p><a href="' + waLink_(whatsapp, msg) + '" style="background:#25D366;color:#fff;padding:8px 14px;border-radius:6px;text-decoration:none">Send on WhatsApp</a></p>' : '<p><i>No WhatsApp number on file</i></p>');
}

function waLink_(number, text) {
  return 'https://wa.me/' + String(number).replace(/\D/g, '') + '?text=' + encodeURIComponent(text);
}

function dueDateInMonth_(today, day, monthOffset) {
  const y = today.getFullYear(), m = today.getMonth() + monthOffset;
  const lastDay = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(Math.max(day, 1), lastDay));
}

function monthKey_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, CONFIG.TIMEZONE, 'yyyy-MM');
  return String(v || '').trim().slice(0, 7);
}

function formatTime_(t) {
  return t instanceof Date ? Utilities.formatDate(t, CONFIG.TIMEZONE, 'HH:mm') : String(t);
}

function dayKey_(d) { return Utilities.formatDate(d, CONFIG.TIMEZONE, 'yyyy-MM-dd'); }
function startOfDay_(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function addDays_(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

function esc_(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function log_(action, details) {
  try { sheet_(SHEETS.LOG).appendRow([new Date(), action, details]); } catch (e) { console.log(action, details); }
}

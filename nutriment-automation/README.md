# Nutriment Properties – free automation starter kit

This kit is for Shashank's property business in Pattaya. It covers buying and renting 1–3 bed apartments and pool villas, Airbnb set-up, commercial property (Walking Street clubs, offices, shops) and hotels for lease or sale. The target buyers are in the USA, Russia, India, China, Japan, the UK, the Philippines and the UAE/Dubai.

Everything here runs on **free tools**: Google Sheets, Google Apps Script and your own website. There are no subscriptions, and nothing needs a server.

| Request from the brief | How this kit handles it | Cost |
|---|---|---|
| Automated lead enquiry | The chat box sends each lead to a Google Sheet. The agent gets an instant email with a one-tap WhatsApp reply button, and the client gets an automatic thank-you email | Free |
| Chat box on the website | `widget/nutriment-chat.js` is a guided chat that qualifies the lead: buy, rent, Airbnb, commercial or hotel, then bedrooms, budget, country, timeline and contact details. It also has WhatsApp and LINE buttons. **Optional:** add [tawk.to](https://www.tawk.to) (free) for live human chat | Free |
| Viewing reminders to clients | Add each viewing to the **Viewings** tab. The day before, the client gets an email and the agent gets a WhatsApp button to send the same message | Free |
| Rent reminders to tenants | Add each tenant to the **Tenants** tab. Reminders go out 3 days before the due date, on the due day, and every 3 days while the rent is overdue. They stop once you type the month into "Paid For" | Free |
| Post listings on the website and all social media at the same time | Add the listing to the **Listings** tab, then use the menu to generate social captions (emoji, price, WhatsApp link, hashtags). Post them through Meta Business Suite and Buffer (see step 4) | Free |

---

## Step 1 – Google Sheet and backend (15 minutes)

1. Create a new Google Sheet (use the business Gmail account) and name it **Nutriment CRM**.
2. Go to **Extensions → Apps Script**, delete the sample code, and paste in all of `apps-script/Code.gs`.
3. Edit the `CONFIG` block at the top:
   - `AGENT_EMAIL`: who receives new-lead alerts and the daily reminder digest
   - `WHATSAPP_NUMBER`: the business WhatsApp number, digits only (for example `66812345678`)
   - Keep `SEND_EMAILS_TO_CLIENTS: false` while you test, then switch it to `true`
4. Click **Save**. Choose `setup` from the function drop-down and click **Run**. Approve the permissions. This creates the tabs Leads, Viewings, Tenants, Listings and Log, plus a daily 9 am (Bangkok) trigger.
5. Click **Deploy → New deployment → Web app**. Set *Execute as*: **Me** and *Who has access*: **Anyone**, then deploy. Copy the **Web app URL**, which ends in `/exec`.
6. Reload the Sheet. A **Nutriment Properties** menu appears. Run **Send test lead** and check that the alert email arrives.

## Step 2 – Chat box on the website (10 minutes)

1. Upload `widget/nutriment-chat.js` to the website. Use the admin panel's media or file manager, or put it on GitHub Pages (step 6).
2. Paste this before `</body>`. Most admin panels have a "custom code", "footer scripts" or "tracking code" setting:

```html
<script>
  window.NutrimentChatConfig = {
    endpoint: 'PASTE_WEB_APP_URL_HERE',
    whatsapp: '66XXXXXXXXX',
    line: 'https://line.me/R/ti/p/@yourlineid', // optional; LINE is big in Thailand and Japan
    color: '#0f766e'                            // brand colour
  };
</script>
<script src="https://YOUR-SITE/path/nutriment-chat.js" defer></script>
```

If the admin panel has no place for custom code, ask whoever built the site to add these lines. It takes them about two minutes.

To try the widget locally first, open `widget/demo.html` in a browser.

## Step 3 – Daily use

- **Leads tab**: change **Status** as each lead moves along (New → Contacted → Viewing booked → Negotiating → Closed).
- **Viewings tab**: add a row for every viewing you book. Put the date in the *Viewing Date* column as a real date. Reminders go out automatically the day before.
- **Tenants tab**: enter the *Due Day* as a number (for example `5`). When rent is paid, type the month, such as `2026-10`, into *Paid For*.
- Every morning the agent gets one email listing every reminder sent, with a green **Send on WhatsApp** button for each. One tap opens WhatsApp with the message already typed.

> **Why WhatsApp messages aren't fully automatic:** automatic WhatsApp sending needs the paid WhatsApp Business Platform (API). Meta charges per message, and from **1 October 2026** it also charges for replies inside the 24-hour window, apart from a monthly free allowance ([Meta pricing](https://developers.facebook.com/docs/whatsapp/pricing)). One-tap `wa.me` links are free and keep the messages personal. If volume grows, look at a Business Solution Provider or Make/Zapier with WhatsApp Cloud.

Also install the free **WhatsApp Business app** on the business phone and set up:
- A **Greeting message** that replies automatically to first-time chats
- An **Away message** for after hours (useful because the clients are in different time zones)
- **Quick replies**, for example `/villa`, `/airbnb` or `/docs`, for answers you send often
- **Labels** (New lead, Viewing, Tenant) and a **Catalogue** containing the top listings

## Step 4 – Listings to social media

1. Add each new property as a row in the **Listings** tab.
2. Choose **Nutriment Properties menu → Generate social captions**. A ready-to-post caption appears in column M.
3. Post it:
   - **Meta Business Suite** (free) schedules to the Facebook Page and Instagram together.
   - **Buffer free plan** covers 3 channels (for example Instagram, TikTok and LinkedIn) with 10 queued posts per channel ([details](https://costbench.com/software/social-media-management/buffer/free-plan)).
   - Also post in Pattaya expat Facebook groups and on Facebook Marketplace (property rentals). These are free and work well for rentals.
   - Property portals such as DDproperty, Hipflat and FazWaz are where buyers search. Agent pricing varies, so check each one's "list your property" page.
4. **Optional, fully automatic:** in [Make.com](https://www.make.com) (free tier), create a scenario where a new row in the Listings sheet posts to the Facebook Page and Instagram.

## Step 5 – Reaching the target countries

| Country | Main channel to add |
|---|---|
| USA, UK, India, Philippines, UAE | WhatsApp, Facebook, Instagram, Google Business Profile |
| Russia | Telegram channel and VK (WhatsApp and Instagram are restricted there) |
| China | WeChat (a personal account is fine to start), plus Xiaohongshu (RED) posts |
| Japan | LINE Official Account (free tier) and Instagram |

Other free improvements:
- Set up a **Google Business Profile** for Pattaya so the business shows up on Google Maps searches.
- Get the website pages translated, at least into Russian and Chinese.
- Keep a separate landing page for each service (Pool villas, Airbnb set-up, Walking Street commercial, Hotels).

## Step 6 (optional) – Host the widget on GitHub Pages for free

Fork or create a public repo, add `nutriment-chat.js`, then turn on **Settings → Pages**. The script will then be available at `https://<user>.github.io/<repo>/nutriment-chat.js`.

## If the business grows: free open-source CRMs

- **[Twenty](https://github.com/twentyhq/twenty)**: a modern CRM (needs about 2 GB RAM to self-host)
- **[EspoCRM](https://github.com/espocrm/espocrm)**: lightweight PHP, configurable from its admin panel, and runs on cheap shared hosting
- **[n8n](https://github.com/n8n-io/n8n)**: a self-hosted automation tool (an open alternative to Zapier and Make)

Until then, the Google Sheet is enough for one or two agents.

## Limits to know

- A free Gmail account can email about **100 recipients per day** from Apps Script. A Google Workspace account can email about 1,500 ([quotas](https://developers.google.com/apps-script/guides/services/quotas)).
- If you edit `Code.gs` later, re-deploy with **Deploy → Manage deployments → Edit → New version** so the URL stays the same.

## Security

- The admin password was shared over email or chat. **Change it** and keep it in a password manager.
- The web app accepts only lead data. Bots are filtered by a honeypot field, and text is cleaned before it goes into the Sheet.

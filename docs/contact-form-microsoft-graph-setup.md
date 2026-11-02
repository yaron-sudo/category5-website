# Category 5 website — contact form email setup (Microsoft 365 / Graph)

The website's contact form is delivered by a small server function on Vercel
(`/api/contact`). It sends each submission as an email to
**info@ethical-supplements.com** through Microsoft Graph, using an app
registration in your Microsoft 365 tenant. No mail client is involved on the
visitor's side, and no mailbox password is stored anywhere.

Why Graph and not SMTP: Microsoft is retiring password-based SMTP AUTH in
Exchange Online (disabled by default from the end of December 2026, removed in
2027). Graph with an app registration is Microsoft's supported path and will
keep working.

Time needed: about 10 minutes. Requires a **Global Administrator** of the
Microsoft 365 tenant for step 1, and access to the Vercel project for step 2.

---

## Step 1 — Register an application in Microsoft Entra

1. Go to https://entra.microsoft.com → **Applications** → **App registrations** → **New registration**.
2. Fill in:
   - **Name:** `Category 5 website contact form`
   - **Supported account types:** *Accounts in this organizational directory only*
   - **Redirect URI:** leave empty
   Click **Register**.
3. On the app's **Overview** page, copy these two values (you will paste them into Vercel):
   - **Application (client) ID**
   - **Directory (tenant) ID**
4. **Certificates & secrets** → **New client secret** → description `Vercel`, expiry **24 months** → **Add**.
   Copy the secret's **Value** immediately — it is shown only once.
5. **API permissions** → **Add a permission** → **Microsoft Graph** →
   **Application permissions** (not *Delegated*) → search **`Mail.Send`** → tick it → **Add permissions**.
6. Still under API permissions, click **Grant admin consent for <your organization>** → **Yes**.
   The status column for `Mail.Send` must show a green "Granted".

## Step 2 — Add the values to the Vercel project

1. Open the Vercel project → **Settings** → **Environment Variables**.
2. Add the following, for both **Production** and **Preview**:

   | Name               | Value                                   |
   |--------------------|-----------------------------------------|
   | `MS_TENANT_ID`     | the *Directory (tenant) ID* from step 1 |
   | `MS_CLIENT_ID`     | the *Application (client) ID*           |
   | `MS_CLIENT_SECRET` | the secret *Value* from step 1.4        |
   | `MS_SENDER`        | `info@ethical-supplements.com`           |
   | `CONTACT_TO`       | `info@ethical-supplements.com`           |

3. **Deployments** → open the latest deployment → **Redeploy** (environment
   variables are read when the function is deployed).

## Step 3 — Test

Open the contact page on the site, fill in the form and press send. Within a
few seconds an email titled "פנייה מהאתר — <name>" should arrive in
info@ethical-supplements.com. Pressing **Reply** on it answers the visitor
directly (their address is set as Reply-To).

If the form shows an error instead, check in Vercel → the deployment →
**Functions / Logs** for a line starting with `contact:` — it states whether
the token request or the send failed, with Microsoft's error text.

---

## Recommended hardening (optional, Exchange admin)

`Mail.Send` at application level allows the app to send from **any** mailbox
in the tenant. To restrict it to the contact mailbox only, run in
Exchange Online PowerShell:

```powershell
Connect-ExchangeOnline
New-ApplicationAccessPolicy -AppId "<Application (client) ID>" `
  -PolicyScopeGroupId info@ethical-supplements.com `
  -AccessRight RestrictAccess `
  -Description "Category 5 website contact form"
Test-ApplicationAccessPolicy -AppId "<Application (client) ID>" -Identity info@ethical-supplements.com
```

The test should report `AccessCheckResult : Granted` for this mailbox (and
Denied for any other).

## Things to remember

- Never paste the client secret into chat, email or tickets — only into Vercel.
- The secret expires after 24 months. Put a calendar reminder: create a new
  secret in Entra, update `MS_CLIENT_SECRET` in Vercel, redeploy. Otherwise the
  form stops delivering on that date.
- To rotate or revoke access at any time: delete the secret (or the whole app
  registration) in Entra.

## Alternatives supported by the site (not recommended for Office 365)

- **Password SMTP** — `SMTP_HOST=smtp.office365.com`, `SMTP_PORT=587`,
  `SMTP_USER`, `SMTP_PASS`. Requires "Authenticated SMTP" enabled on the
  mailbox and no MFA / security defaults blocking legacy auth. Stops working
  when Microsoft disables basic authentication.
- **Resend** (third-party email API) — `RESEND_API_KEY`, `CONTACT_FROM`;
  requires verifying ethical-supplements.com at resend.com.

The function picks Graph when the `MS_*` variables are present, otherwise
SMTP, otherwise Resend.

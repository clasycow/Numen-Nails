# Numen Nails private studio service

The public atelier and brand studio work on the current static site. This private
service is built and tested locally, but has **not been provisioned or deployed**.
`NUMEN_CONFIG.studioApiBase` is deliberately empty. The existing inquiry Worker
continues to receive public inquiries until this service is activated.

## What the connected service provides

- Owner sign-in verified against Cloudflare Access signatures, issuer, audience,
  expiry, and an exact email allowlist. Every private API request is verified.
- A private inquiry inbox with reference photos, notes, design histories and
  manual deposit tracking. Existing emailed inquiries are not imported.
- One-off availability slots with atomic reservation and overlap checks. A
  visitor's request does not reserve or confirm a slot automatically.
- Catalog, grouped photo, atmosphere, and price editing. Publishing updates the
  homepage gallery/prices and atelier. Public pages retain their committed
  catalog if the API cannot load.
- A configured Cash App profile link. This does not process payments or verify
  Cash App transactions. The artist checks payments and marks deposits received.
- Opt-in email reminders within 24 hours of confirmed appointments, disabled by
  default. Provider idempotency keys and a database claim prevent duplicate sends
  during retries. Owner status changes do not send confirmation emails.
- The owner can download a confirmed appointment as a calendar file. This does
  not connect or synchronize an external calendar.

## Setup using your own Cloudflare account

1. Create a D1 database `numen-studio`, an R2 bucket `numen-studio-media`, and a KV
   namespace for `INQUIRY_RATE_LIMIT`. Keep the R2 bucket private; the Worker only
   serves the `public/` prefix publicly. Client photos use the protected
   `inquiries/` prefix.
2. Copy `wrangler.example.jsonc` to a local `wrangler.jsonc`. Fill the returned
   binding IDs and your exact owner email(s). Do not replace the existing inquiry
   Worker. This is a separate Worker on `/api/studio/*`.
3. Create a self-hosted Cloudflare Access application for
   `numennails.com/api/studio/admin/*`. Allow only your owner email(s), using your
   preferred verified sign-in method. Copy its application audience and team
   domain into the configuration. The owner shell at `/owner.html` is public;
   it contains no private data. Access protects the API that supplies that data.
4. Add encrypted Worker secrets for `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`,
   `OPENAI_API_KEY`, `INQUIRY_TO_EMAIL`, and `INQUIRY_FROM_EMAIL`, using the same
   verified services as the existing inquiry setup. Never put these values in
   JavaScript, committed configuration, or a chat message.
5. From `studio-api`, apply the migration and deploy with your authenticated
   Wrangler CLI:

   ```sh
   npx wrangler d1 migrations apply numen-studio --remote
   npx wrangler deploy
   ```

6. Verify the service before activation: an unauthenticated request to
   `/api/studio/admin/state` must require sign-in; an authorized owner must see
   an empty inbox and the nine existing collections. Check that a private photo
   cannot be accessed through `/api/studio/media/`.
7. Set `studioApiBase: "/api/studio"` in `js/config.js` and publish that change.
   Visit `/owner.html`, sign in, publish one opening, and verify it appears in
   `/studio.html#booking`. Enter the Cash App profile URL in Prices & deposits.
8. Send a deliberate test inquiry with an address you control. Confirm its
   receipt, owner record, and private reference attachment. Confirm/cancel test
   slots, verify reservation conflicts, then remove or mark the test record.
9. Enable `REMINDERS_ENABLED` only after verifying the email sender and obtaining
   the intended client opt-in through the inquiry form. The cron runs every 15
   minutes. A client who did not opt in receives no automatic reminder.

## Reversible activation and maintenance

Setting `studioApiBase` back to `""` restores the original inquiry endpoint and
the committed catalog immediately after site deployment. It does not delete
private records. Keep records according to the owner's actual retention policy;
this initial implementation does not perform automatic deletion.

The owner inbox loads the newest 500 requests. Exact-email history queries load
up to 1,000 requests. Anonymous visitors cannot search client histories. Uploaded
catalog photos that are removed from a draft are not automatically deleted from
storage; remove orphaned public objects during maintenance if desired.

The original inquiry sender delivers email before the new service records the
request. An unexpected database/storage failure after email delivery can require
manual reconciliation from the delivered email. Do not treat the dashboard as
the only copy of an inquiry until that delivery/storage workflow has been
validated against the production bindings.

## Verification

`node --test tests/studio-api.test.mjs` from the repository root exercises signed
and forged owner tokens, CSRF/origin checks, private/public separation, catalog
version conflicts, concurrent slot reservation, overlapping openings, upload
validation, policy acceptance, and consent/idempotency of reminders. Network
providers are mocked; these tests send no emails and do not access live clients.

Runtime reference documentation:
- [Cloudflare Access JWT verification](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [D1 prepared statements](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)
- [Worker cron triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
- [Resend idempotency keys](https://resend.com/docs/dashboard/emails/idempotency-keys)

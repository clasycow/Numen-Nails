# Numen Nails - the enchanted atelier

## Public pages

- `/studio.html`: six connected rooms - interactive salon, dream-set builder,
  local hand-photo try-on, collection storybook, inspiration quiz, and visit planning.
- `/brand-studio.html`: customizable social posts/stories, business cards, care
  cards and packaging labels. Exports PNG files; posts nothing automatically.
- `/owner.html`: private-service sign-in and an explicit empty-data preview. The
  preview can export catalog drafts. It cannot access clients or publish changes.

The homepage now opens the atelier, with a separate illustrated salon entrance
below the forest. All nine original sets and 22 photographs remain available.
The original gallery, policies, pricing, motion control and inquiry endpoint are
preserved. A fill option was added to the inquiry service selector.

## Design flow

Five independently editable nails share shape, length and service type. Each
nail has its own color, finish, decorative detail and vector brush strokes. The
rotatable preview uses a real curved WebGL mesh with specular lighting; a flat
canvas fallback handles devices without WebGL. These are original design
concepts, not accurate 3D scans of the photographed collections.

The hand-photo tool is a manual visual mockup: visitors place, rotate, resize,
and adjust the opacity of five overlays. Hand photos are decoded in browser
memory, never uploaded, and removed when the visitor clears them or leaves.
Downloads and the nail-art canvas use local canvas rendering.

Up to 12 design drafts can be saved in the current browser. Visitors can download
their concept or carry it into the existing inquiry form. The handoff attaches a
JPEG of the nail concept and fills a reviewable message. It never sends an
inquiry automatically. Hand photos are not included automatically.

The quiz recommends actual photographed collections. Collection inspiration
creates a fresh palette-based concept rather than reproducing intricate artwork.
The storybook supports all photographs in each set, page turning, and a direct
collection selector. Existing rotation metadata is respected.

The fairy flaps her wings, offers context-sensitive hints, and briefly visits
selected details. The room has three discoveries and six seasonal treatments,
plus automatic month-based selection. Pause and reduced-motion settings suppress
animation. No sound or tracking service was added.

## Brand collection

`assets/brand/numen-nails-brand-kit.zip` contains the two PDFs, five example PNGs,
the scalable crescent SVG and a readme. The print PDF has five pages: business
card front/back, care card, flat packaging label, and thank-you insert. It defines
trim and bleed boxes; the brand guide lists their dimensions. RGB color artwork
should be proofed by the chosen printer. Fonts are self-hosted with their OFL
licenses under `assets/fonts/`.

## Business integration state

The optional Worker, database migration, owner interface and tests are included
under `studio-api/` and `tests/`. Cloudflare was not connected for this task, so
the private service, shared availability, new inquiry records, Cash App profile
link and automatic reminders are **not activated**. No client emails were sent
during development or tests. No calendar or payment account was connected.

See `studio-api/SETUP.md` for concrete activation steps and operating limits.
The existing form still sends through the existing standalone inquiry Worker.
Preferred appointment dates are requests for the artist to confirm personally.

## Artwork provenance

The built-in image generator created the salon scenery as a new illustration.
The source PNG was encoded as a 1536 x 1024 WebP for the website:
`assets/img/enchanted-salon.webp`. The fairy, forest and collection-world artwork
from the previous release are reused. No client nail photograph was generated
or retouched. Brand graphics use native canvas/SVG drawing and the actual photos.

Salon generation prompt:

> Use case: stylized-concept. Asset type: panoramic interactive website salon
> backdrop. Create a beautiful immersive enchanted nail salon inside an elegant
> woodland conservatory at blue-violet twilight. Detailed painterly realism with
> photographic material detail, quiet luxury, plum velvet, warm ivory marble,
> muted gold brass, lilac flowers and delicate climbing wisteria. Wide landscape
> 1536x1024, eye-level straight-on room, no people. Important functional
> composition: on the left third an antique arched glass display cabinet with
> rows of small decorative nail-art display stands and tiny polish bottles; at
> center a beautiful gold framed oval mirror above a cream marble nail artist
> vanity with lavender velvet stool; on the right third a lectern holding a
> large open cream-paged storybook and a small crescent lamp. Tall arched windows
> behind show the moonlit violet forest, floor leads gently toward center.
> Several tiny luminous mushrooms near lower corners, golden fireflies and
> delicate magical light, restrained and atmospheric. Keep the furnishings
> distinct and evenly spaced to support website hotspots. Space at top center
> for overlaid headline. No text, no written labels, no words, no UI, no
> watermark. Rich depth, warm realistic candlelight meeting cool moonlight.
> Sophisticated charming fantasy illustration, not cartoon.

## Validation

Browser checks cover all six rooms, 3D customization, painting, saved designs,
local photo selection/removal, storybook photo/set navigation, quiz results,
inquiry message/image handoff, owner preview, catalog drafts, Eastern-time slot
creation, live-catalog behavior with an isolated test API, brand export formats,
and desktop/mobile layouts down to 320 pixels.

The backend test suite uses actual SQLite transactions and signed test JWTs;
all external services are mocked. PDF pages were rendered and visually checked.
No new production secrets, clients, payments, or appointment records are part
of this commit.

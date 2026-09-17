# Numen Nails — living forest and collection worlds

## What changed

- A perspective WebGL forest combines two painted depth planes and animated fireflies. Pointer movement and scrolling shift the camera. This is an illustrated depth scene, not a fully modeled game environment.
- The fairy has a separate body and wing layer, independently flapping wings, a floating flight path, and gentle pointer response. A miniature fairy marks the current section on wide screens.
- Cursor stardust and touch ripples add small moments of interaction.
- Five illustrated collection atmospheres — Moonlit Forest, Cherry Blossom, Midnight Muse, Ocean Dreams, and Starlight — change the gallery surroundings. Scene controls do not filter or hide sets.
- Crystal-style card lighting and themed photo viewers frame the existing nail photographs. All nine nail sets, all 22 gallery photographs, and the inquiry form are preserved.
- One persistent motion control pauses the site effects. Reduced-motion preferences, background tabs, offscreen forest rendering, unavailable WebGL, and missing fairy layers have fallback behavior.

## Files and performance

New runtime files: `css/enchanted-world.css` and `js/enchanted-world.js`. Integration updates: `index.html`, `js/hero-fairy.js`, and `js/scripts.js`.

New assets:
- `assets/img/fairy-body.webp`
- `assets/img/fairy-wings.webp`
- `assets/img/forest-canopy.webp`
- `assets/img/forest-distant.webp`
- `assets/img/realm-blossom.webp`
- `assets/img/realm-midnight.webp`
- `assets/img/realm-ocean.webp`
- `assets/img/realm-starlight.webp`

No new external runtime library is required. The animation loop is capped at 30 frames per second and device-pixel ratio at 1.5; phones use fewer particles. Collection illustrations load when needed. Existing complete-fairy and forest artwork remain as fallbacks.

## Image provenance and generation settings

The built-in image generator created the assets below; Sharp resized and encoded WebP delivery copies. The fairy body and wings were edits of the existing fairy cutout; the forest layers were derived from the existing forest artwork. The four collection environments were new landscape illustrations. No generated image replaces a client's nail photograph.

Generation mode: image editing for body, wings, canopy, and distant forest; new image generation for the four collection worlds. Delivery sizes: fairy layers 900 × 600, forest layers 1536 × 1024, collection worlds 1440 × 960. Transparent layers retain their alpha channel.

## Generation prompts

### body

Use case: precise-object-edit / background-extraction. This is a registered animation layer. The input is a fairy sprite on transparency. Keep EXACT canvas dimensions 1536x1024 and preserve the fairy's body, face, hair, crown, arms, glowing fingertip star, violet dress and legs at EXACTLY the same positions and scale. Remove ONLY all of the large insect wings behind her back and their background glow, leaving transparent pixels in their place. Do not move, enlarge, center, or crop the character. Keep all other parts of the character pixel-aligned to the reference as closely as possible. Preserve genuine alpha transparency. No solid black background, no checkerboard artwork, no text. Output the full unchanged-size transparent canvas with a wingless fairy body; this will be composited over separately animated wings.

### wings

Use case: background-extraction. This is a registered animation layer. Extract ONLY the translucent lavender-gold insect wings of the input fairy sprite. Keep EXACT canvas dimensions 1536x1024, and leave these wings at their EXACT original coordinates, size, orientation, lighting and style in the upper left portion of the canvas. Remove all body, head, hair, flower crown, arms, fingertip star, dress, legs, and surrounding glow. Complete only the small obscured wing roots where the body overlaps them. Wing roots should converge around x=800 y=425 as in the reference. Retain extremely fine golden wing veins and sparkling transparent wing membranes. Do NOT center, reposition, resize or crop the wings. Output a genuine transparent alpha canvas, no black background, no drawn checkerboard, no text.

### canopy

Use case: background-extraction. Asset type: near foreground layer for a perspective 3D website scene. Keep the exact 1536x1024 canvas, framing, coordinates and scale of the input image. Extract ONLY the nearest framing scenery: the dark flowering arch of branches along the top edge, the thick dark tree trunk and purple leaves touching the left and right edges, and the very closest large purple flowers and leaves at the bottom left and bottom right corners. Preserve their detailed texture, original twilight illumination and palette. Replace all the inner forest, distant trees, sky, moons, mountain, stream, distant ground, and fairy dust with TRUE TRANSPARENT ALPHA. The entire central opening, roughly 25%-75% horizontally and 15%-100% vertically, should be transparent, including a clear opening to the bottom edge over the stream. Keep the side branches in their exact original positions. No reframing, no new features, no black fill, no foggy painted background, no checkerboard pattern, no text. One single full-size transparent foreground frame, to move independently over the original forest.

### distant

Use case: precise-object-edit. Asset type: far-background plate for a layered 3D enchanted forest website. Keep exact 1536x1024 dimensions, the central composition, two moon crescents, the purple twilight sky, distant pine forest, mountains, golden curving fairy-dust trail, and central stream. Remove ONLY the near framing arch of branches and flowers across the top, thick trunks against left/right edges, and very nearest oversized flowers, leaves, mushrooms along bottom corners. Fill those removed border areas seamlessly with more of the distant purple pine forest and twilight sky/forest floor, matching the original scale and perspective of the background. There should be no close foreground frame around this image, since a separate transparent layer will provide that. Keep the untouched central scene exact, no fairy, no text. A detailed atmospheric purple forest background that extends naturally to every edge.

### blossom

Use case: stylized-concept. Asset type: illustrated background scenery for a high-end fantasy nail-art website. Input image is STYLE REFERENCE ONLY: match its detailed painterly realism, luxurious botanical texture, enchanting lighting and immersive sense of place. Create this different setting: A moonlit enchanted cherry-blossom garden. Blush pink and dusty rose flowering trees arch inward from both sides, delicate drifting petals, a tiny reflective stream and curved wooden bridge in the middle distance, subtle gold firefly dust. Twilight mauve-pink sky with a slender crescent. Softly romantic, rich dark-plum shadows at the edges. Landscape 1536x1024. Keep the central area quiet, darker, spacious and atmospheric so website headings and nail photos remain readable on top; place the most detailed features at the edges. No people, no fairy, no hands, no nail products, no words, no watermark, no frames or UI. One complete scene, with beautiful readable composition.

### midnight

Use case: stylized-concept. Asset type: illustrated background scenery for a high-end fantasy nail-art website. Input image is STYLE REFERENCE ONLY: match its detailed painterly realism, luxurious botanical texture, enchanting lighting and immersive sense of place. Create this different setting: An enchanted gothic moon garden in deep violet, ink blue and muted burgundy. Weathered pointed stone arches frame the sides, dark climbing roses and elegant thorn vines, a distant silhouette of a small fairytale castle among pines, a glowing crescent moon and sparse purple-gold starlight. Sophisticated dark romance; atmospheric and beautiful, no horror characters. Landscape 1536x1024. Keep the central area quiet, darker, spacious and atmospheric so website headings and nail photos remain readable on top; place the most detailed features at the edges. No people, no fairy, no hands, no nail products, no words, no watermark, no frames or UI. One complete scene, with beautiful readable composition.

### ocean

Use case: stylized-concept. Asset type: illustrated background scenery for a high-end fantasy nail-art website. Input image is STYLE REFERENCE ONLY: match its detailed painterly realism, luxurious botanical texture, enchanting lighting and immersive sense of place. Create this different setting: An enchanted moonlit lagoon in deep teal, sea-glass turquoise and midnight blue. Still crystalline water with gentle luminous ripples and a path of moon reflections, flowering shoreline foliage and delicate pearl-like lights, a few luminous water lilies, distant shadowy cliffs, slender crescent moon above. Elegant fantasy seascape, calm and immersive. Landscape 1536x1024. Keep the central area quiet, darker, spacious and atmospheric so website headings and nail photos remain readable on top; place the most detailed features at the edges. No people, no fairy, no hands, no nail products, no words, no watermark, no frames or UI. One complete scene, with beautiful readable composition.

### starlight

Use case: stylized-concept. Asset type: illustrated background scenery for a high-end fantasy nail-art website. Input image is STYLE REFERENCE ONLY: match its detailed painterly realism, luxurious botanical texture, enchanting lighting and immersive sense of place. Create this different setting: An enchanted celestial garden under a spectacular midnight indigo sky. Countless delicate golden stars and fine constellations, a bright slender crescent, elegant distant floating garden islands and a winding stream reflecting the stars, deep-purple foliage and tiny luminous golden flowers at the edges. Warm gold details against rich navy. Serene magical wonder, no explosions. Landscape 1536x1024. Keep the central area quiet, darker, spacious and atmospheric so website headings and nail photos remain readable on top; place the most detailed features at the edges. No people, no fairy, no hands, no nail products, no words, no watermark, no frames or UI. One complete scene, with beautiful readable composition.

## Verification

Checked in Chromium on desktop, tablet, portrait phone, small phone, and landscape layouts. Verified WebGL rendering, independent wing motion, pointer response, pause/resume, all five illustrated collection scenes, gallery expansion, photo navigation, mobile navigation, reduced-motion behavior, WebGL fallback, and missing-wing fallback. A 320 × 568 touch viewport fits the full brand and primary hero action; tapping opens, advances, and closes the photo viewer. The final scene checks reported no JavaScript runtime errors or missing local image assets. Source comparisons confirmed all nine sets, 22 photographs, and the inquiry form were preserved.

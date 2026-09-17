# Homepage fairy animation

The homepage now layers a floating fairy over a forest background. The original `numen-nails-fairy.jpg` remains the fallback until both new layers have loaded and decoded. Nothing in the gallery, client agreement, or inquiry form was changed.

## Files

- `assets/img/forest-without-fairy.webp`: forest background, 1536 × 1024.
- `assets/img/fairy-sprite.webp`: transparent fairy, 900 × 600.
- `css/hero-fairy.css`: hover, glow, falling fairy dust, responsive placement, and motion controls.
- `js/hero-fairy.js`: image loading, pause/resume, reduced motion, and offscreen/tab pause.

Artwork was separated with the built-in image generation tool, using `assets/img/numen-nails-fairy.jpg` as the reference. The generated artwork was encoded as WebP for the website. This is a gentle floating animation; the wings are part of the sprite and are not independently rigged.

## Generation prompts

### Forest

Use case: precise-object-edit. Asset type: clean background plate for a layered animated website hero. Input image 1 is the edit target. Remove ONLY the flying fairy in the left middle of this exact forest image (including her wings, body, hair, dress, legs, reaching hand and the bright star immediately at her fingertips). Seamlessly inpaint the trees and purple sky behind her. Preserve the rest of the image and its exact composition, aspect ratio 3:2, 1536x1024 dimensions, framing, two crescents, colors, detail, flowers, stream, trees, landscape and remaining curving magical golden trail. No other changes, no text, no border. The result must be one single background image without any fairy. Maintain the same detailed illustrative style and fine detail.

### Fairy

Use case: background-extraction. Asset type: transparent fairy sprite for animating the character on an existing website. Input image 1 is the edit target. Extract ONLY the existing flying fairy from the left-middle of this exact reference, maintaining her original appearance, pose, right-facing direction, anatomy, violet floating dress, long brown flowing hair, flower crown, translucent golden/lavender detailed wings and outstretched right hand. Preserve the tiny bright star at her fingertips. Remove absolutely all forest, tree trunks, flowers, sky, moons, river and sweeping background trail. Output a tightly framed landscape canvas around this ONE complete fairy with slight clear padding, on a genuinely transparent alpha-channel background (not solid color or a drawn checkerboard). Entire wings, trailing dress, toes and fingertips visible with clean detailed antialiased transparent edges. No new objects, no reinvention, no text, no watermark. Keep the fairy exactly like the reference; this is an extraction for layered animation, not a character redesign.

## Verification

Checked the layout in Chromium at desktop, tablet, portrait phone, small phone, and landscape phone sizes. Verified motion, pause/resume (including mist), reduced motion, pausing outside the viewport, no horizontal overflow, and the original-image fallback after an asset request fails. No JavaScript page errors. External booking services were not submitted or changed.

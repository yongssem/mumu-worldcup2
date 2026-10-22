# Landing artwork

Created with the built-in ImageGen tool on 2026-10-22 for this app. No external reference image was used. The uncompressed generated original is retained with the delivery files; the app ships optimized derivatives only.

| Asset | Size | Purpose |
| --- | ---: | --- |
| Original PNG | 2,292,836 bytes | Archival original |
| `public/landing-stadium.webp` | 195,228 bytes | 1536px landing image; 91.5% smaller |
| `public/landing-stadium-mobile.webp` | 66,518 bytes | 768px responsive source; 97.1% smaller |
| `public/og-cover.jpg` | 145,834 bytes | 1200×630 social sharing preview |

Resize, encoding and social aspect-ratio cropping use Sharp. The generated scene itself is preserved. The browser chooses a source using `srcset` and `sizes`; the hero has a high fetch priority and explicit dimensions.

## Generation prompt

Use case: stylized-concept. Asset type: premium landing-page hero artwork for Mumu World Cup 2, a Korean finger-flick tabletop football game. Generate one finished raster artwork, not a webpage or interface. Landscape 3:2 composition, high-end cinematic tactile 3D still life. On a miniature deep emerald football pitch with crisp cream field markings, a glossy cobalt-blue round plastic football playing disc faces a vermilion-red disc, with a beautiful black-and-ivory football in the foreground, frozen at the instant before an exciting shot. The discs are low squat circular board-game tokens, not humans, not hockey pucks with sticks; subtle concentric molded rims and realistic plastic specular highlights. Camera close to turf at a dramatic three-quarter overhead angle, large blue disc lower left, football lower middle-right, red disc further upper right, tiny goal net in distant background. Stadium floodlights above the far pitch create soft warm amber edge lighting and a touch of atmospheric mist, dark forest-green near-black background. Colors harmonize with #0b1715 dark green and #ff9155 warm orange interface, rich blue and red tokens. Professional sports campaign quality, beautifully crafted and playful, convincing miniature scale, soft depth of field but clear main subjects, premium physical material detail, restrained dynamic motion streak on the football, no glitter, no confetti. Composition fills frame with generous dark breathing room in upper left, subjects safely inside central 80 percent for responsive crops. No text, no letters, no numbers, no logos, no watermark, no UI, no human hands or people. Render a stunning polished image with strong readable silhouettes.

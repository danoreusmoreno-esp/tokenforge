# Tokenforge — design

Style: framed sheet (taste-skill app style, seed 1071450253). Neutral, Figma/Linear-like chrome.

- **The move.** One tinted L-frame (sidebar + 48px top bar, no rule between them) on `#f6f7f8`; the work sits on a white sheet inset 8px from the right and bottom edges, 1px `#e6e8ea` edge, 16px radius, no shadow. Dark theme mirrors it on true neutrals.
- **Colour.** Chrome has no hue. The only colour on screen is the user's brand inside the sheet (`.ds` tokens). Primary chrome action is near-black. Active nav = neutral grey pill. Active tab = 2px ink underline.
- **Type.** IBM Plex Sans 400/500/600 for chrome; IBM Plex Mono for token names, hex values and code only. Sizes 12 / 13 / 14 / 16 / 22. Tabular figures on numbers.
- **Surfaces.** Border or tone step, never shadow at rest. Shadows only on floating things (popovers, inspector drawer on small screens).
- **Radius.** Sheet 16, panels 10, controls 8, chips 6.
- **Motion.** Feedback only (Emil Kowalski): 120–200ms, `cubic-bezier(.23,1,.32,1)` ease-out, `scale(.97)` on press, no entrance choreography, respects reduced motion.
- **Phone.** Frame disappears; sheet is the screen; rail and inspector become sheets.

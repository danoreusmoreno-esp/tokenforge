# Tokenforge — design

Style: bento (reference supplied by Daniel, 2026-11-06). Replaces the earlier framed-sheet chrome.

- **Shell.** Grey ground (`#ebebee`; dark `#0a0a0b`). A dark floating icon rail (88px, radius 28) with 52px round buttons; the active item takes a pale tint of the brand's accent. Workspace column with a brand pill and pill actions. The inspector is a floating white card on the right (336px). Tablet: inspector becomes a drawer; phone: the rail becomes a labelled drawer.
- **Cards.** Every section is a white card, radius 28, padding 28–32, 20px apart. Secondary blocks inside a card are grey tiles (`#f4f4f6`, radius 20), never nested cards.
- **Colour.** The tool is neutral except for highlights taken from the brand being built (`--c-tint` = accent step 4, `--c-tint-strong` = step 6, `--c-tint-ink` = step 12): active rail item, home hero, selected choices, components in the system. The brand's full tokens apply only inside live areas (`<Live>`).
- **Type.** Onest 400/500 for the UI (titles 34/40 at 500, card titles 22/28, body 14–16); IBM Plex Mono only for token names, hex and code. Headline figures 56px on Home.
- **Controls.** Pill buttons (44px, radius 999): black for the primary action, white or grey for secondary; 36px round icon buttons.
- **Motion.** Feedback only: 140–260ms, `cubic-bezier(.23,1,.32,1)`, `scale(.97)` on press, drawers with `cubic-bezier(.32,.72,0,1)`; hover effects gated to fine pointers; reduced motion respected.

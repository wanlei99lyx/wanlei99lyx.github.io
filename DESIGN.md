# Design

## Theme

Dark mode default. Dark surface with blue-purple tech accents — inspired by midnight coding sessions and oscilloscope glow. Pure near-black background lets the cool blue-purple primary breathe like neon against night sky.

## Mood

"深夜实验室 — 示波器蓝光透过暗色玻璃" (Midnight lab — oscilloscope blue glow through dark glass)

## Color Strategy

**Restrained dark**. Pure black bg carries the brand; blue-purple primary + cyan accent provide ≤20% of surface area.

### Palette (OKLCH)

| Role | Value | Usage |
|------|-------|-------|
| **bg** | oklch(0.05 0 0) | Page background — pure near-black |
| **surface** | oklch(0.10 0.012 260) | Cards, panels, nav |
| **surface-raised** | oklch(0.14 0.015 260) | Hover states, elevated cards |
| **border** | oklch(0.20 0.015 260) | Dividers, subtle borders |
| **primary** | oklch(0.60 0.16 265) | Brand color: deep blue-purple |
| **primary-glow** | oklch(0.65 0.18 265) | Hover, glow effects |
| **accent** | oklch(0.70 0.14 200) | Cyan accent: links, highlights |
| **ink** | oklch(0.93 0.006 258) | Body text (>=15:1 contrast) |
| **ink-secondary** | oklch(0.68 0.012 258) | Secondary text (>=7:1 contrast) |
| **muted** | oklch(0.52 0.010 258) | Metadata, captions (>=4.5:1) |
| **success** | oklch(0.60 0.14 150) | Green for positive signals |
| **warning** | oklch(0.65 0.14 85) | Amber for warnings |
| **error** | oklch(0.55 0.16 30) | Red for errors |

### Light Reading Mode

`.post-reading-surface` carries a `data-reading-theme` override on `<html>`. It
**inverts the same light source** rather than switching to a paper metaphor. The
page around it is pure black, and black is achromatic — so any paper with real
chroma becomes the only coloured object on screen and reads as pasted on. Keep
the paper's channel spread near 4/255.

| Role | Value | sRGB / contrast |
|------|-------|-----------------|
| **paper** | oklch(0.968 0.004 258) | rgb(243,244,247) |
| **inset** | oklch(0.944 0.005 258) | rgb(234,237,240) |
| **ink** | oklch(0.21 0.018 258) | 16.1:1 |
| **secondary** | oklch(0.43 0.016 258) | 7.4:1 |
| **muted** | oklch(0.52 0.012 258) | 5.0:1 |
| **border** | oklch(0.885 0.007 258) | hairline |
| **focus / links** | oklch(0.47 0.115 200) | 5.6:1 |
| **accent / hover** | oklch(0.47 0.155 265) | 6.4:1 |

Every text token clears WCAG AA on both paper and inset. `muted` is the lightest
value that does — don't lighten it without re-running the contrast check.
Switching to light also dims `#starField` to 0.22 and `.noise` to 0.012, so the
reading surface is the only lit thing on the page.

The radius is `--radius-lg`; the shadow is a tight neutral contact shadow plus a
brand-violet bloom, not a brown drop shadow — on black a card needs to look lit
by the brand rather than glued onto it.

## Typography

### Font Stack

CJK-first. A Latin-first stack (`system-ui, 'Segoe UI'…`) renders Latin from one
face and CJK from a per-glyph fallback, so mixed headlines drift off-baseline and
the weight looks uneven. Put the CJK families first; the Latin display face then
only fills glyphs they lack.

```scss
--font-cjk:     'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC',
                'Source Han Sans SC', 'Hiragino Sans GB';
--font-display: 'Archivo', var(--font-cjk), -apple-system, 'Segoe UI', sans-serif;
--font-body:    var(--font-cjk), -apple-system, 'Segoe UI', 'Archivo', Roboto, sans-serif;
--font-mono:    'JetBrains Mono', 'Cascadia Code', 'SFMono-Regular', ui-monospace, monospace;
```

`Archivo` and `JetBrains Mono` are **self-hosted** in `assets/fonts/` (see
`_sass/_fonts.scss`), latin + latin-ext subsets only. `fonts.googleapis.com` is
unreachable from mainland China: the old `<link>` was render-blocking *and* kept
the mono face from ever applying. Both families are loaded as variable fonts, so
one file per subset covers the whole weight range — 4 files, 123,136 bytes (120 KiB)
total, down from 213 KB when each weight was fetched separately.

### Scale

```scss
Body:        clamp(1rem, 0.5vw + 0.875rem, 1.0625rem)      // 16px floor, 1.8 line-height
Hero title:  clamp(2.25rem, 5vw + 0.75rem, 4rem)           // 1.08 / -0.035em
Post title:  clamp(1.875rem, 3.2vw + 0.4rem, 2.75rem)      // 1.16 / -0.03em
Page title:  clamp(1.75rem, 3vw + 0.5rem, 2.5rem)
Section:     clamp(1.5rem, 2.5vw + 0.5rem, 2rem)
Article h2/h3/h4:  1.625rem / 1.3125rem / 1.125rem          // fixed within the column
```

Body line-height: 1.8 — 1.75 is tight for CJK; the extra leading keeps dense
paragraphs from greying out.
Heading line-height: 1.3 (display sizes override this per component)
Code line-height: 1.6

Headings use `var(--font-display)` with negative tracking and `text-wrap: balance`;
paragraphs use `text-wrap: pretty`.

## Spacing

4px base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

Section padding: clamp(3rem, 8vw, 6rem)
Content max-width: 720px (for readability), wide: 1280px
Article content max-width: **`--measure: 34em`** — about 34 CJK glyphs per line.
72ch of Latin runs to ~36 Chinese characters, which already overshoots the
comfortable line-return distance, so the measure is set in em against CJK.

### Radii

One scale instead of ad-hoc 4/6/8/10/12/18/999 values:

```
--radius-sm: 6px   --radius-md: 10px   --radius-lg: 14px   --radius-pill: 999px
```

## Layout

- **Homepage**: Hero + featured posts grid + recent articles + project showcase
- **Blog index**: Ruled single-column list (date in a fixed mono column, then the
  body), featured section as three hairline-separated columns. Deliberately not
  the homepage's bordered card grid: the homepage is a display surface, the index
  is a scanning surface.
- **Article page**: Centered content column with table of contents sidebar on
  desktop; below 640px the AI-news sidebar becomes a horizontally scrollable chip
  strip (chips need a fixed width or `min-width: 0` crushes them to padding).
- **Responsive**: Mobile-first, single column on mobile, sidebar on desktop.
  Tables get `display: block; overflow-x: auto` below 640px in **both** themes —
  long numeric cells can't wrap and would otherwise widen the whole document.

## Z-Index Scale

Exposed as `--z-*` tokens in `_sass/_tokens.scss`. Use the token, not a literal.

- base: 0
- dropdown: 10
- sticky: 20
- nav: 30
- modal-backdrop: 40
- modal: 50
- toast: 60
- tooltip: 70

## Motion

- Page transitions: subtle fade-in (200ms ease-out)
- Hover: 150ms ease-out on interactive elements
- Reading-theme switch: 240ms ease-out on background, shadow and colour;
  `#starField` cross-fades over 260ms
- Reduced motion: respect `prefers-reduced-motion: reduce`
- No bounce, no elastic — professional restraint

## Component Tokens

### Button
- padding: 0.5rem 1.25rem
- radius: var(--radius-sm)
- transition: 150ms ease-out

### Card
- bg: surface
- border: border (1px)
- radius: var(--radius-md)
- padding: 1.5rem
- hover: surface-raised, subtle glow border

### Code Block
- bg: oklch(0.08 0.01 260)
- border: border
- radius: var(--radius-sm)
- padding: 1rem
- font: var(--font-mono), 0.875rem

### Nav
- height: 3.5rem (56px)
- bg: semi-transparent black (backdrop-filter blur)
- border-bottom: border

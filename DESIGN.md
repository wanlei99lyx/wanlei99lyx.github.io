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
| **ink** | oklch(0.92 0.008 260) | Body text (>=15:1 contrast) |
| **ink-secondary** | oklch(0.62 0.012 260) | Secondary text (>=7:1 contrast) |
| **muted** | oklch(0.40 0.01 260) | Metadata, captions |
| **success** | oklch(0.60 0.14 150) | Green for positive signals |
| **warning** | oklch(0.65 0.14 85) | Amber for warnings |
| **error** | oklch(0.55 0.16 30) | Red for errors |

## Typography

### Font Stack

- **Body/Headings**: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif — clean system stack for CJK readability, no external dependencies
- **Code**: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace — sharp coding font for precision engineering feel

### Scale

```
Body:    clamp(0.875rem, 1vw + 0.5rem, 1rem)
H5:      clamp(1rem, 1vw + 0.5rem, 1.125rem)
H4:      clamp(1.125rem, 1.5vw + 0.5rem, 1.375rem)
H3:      clamp(1.25rem, 2vw + 0.5rem, 1.75rem)
H2:      clamp(1.5rem, 2.5vw + 0.5rem, 2.25rem)
H1:      clamp(1.75rem, 3vw + 0.5rem, 2.75rem)
Hero:    clamp(2rem, 4vw + 1rem, 3.5rem)
```

Body line-height: 1.75
Heading line-height: 1.3
Code line-height: 1.6

## Spacing

4px base unit. Scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96

Section padding: clamp(3rem, 8vw, 6rem)
Content max-width: 720px (for readability)
Article content max-width: 72ch

## Layout

- **Homepage**: Hero + featured posts grid + recent articles + project showcase
- **Blog index**: List layout with post preview cards
- **Article page**: Centered content column with table of contents sidebar on desktop
- **Responsive**: Mobile-first, single column on mobile, sidebar on desktop

## Z-Index Scale

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
- Reduced motion: respect `prefers-reduced-motion: reduce`
- No bounce, no elastic — professional restraint

## Component Tokens

### Button
- padding: 0.5rem 1.25rem
- radius: 8px
- transition: 150ms ease-out

### Card
- bg: surface
- border: border (1px)
- radius: 12px
- padding: 1.5rem
- hover: surface-raised, subtle glow border

### Code Block
- bg: oklch(0.08 0.01 260)
- border: border
- radius: 8px
- padding: 1rem
- font: 'JetBrains Mono', monospace, 0.875rem

### Nav
- height: 3.5rem (56px)
- bg: semi-transparent black (backdrop-filter blur)
- border-bottom: border

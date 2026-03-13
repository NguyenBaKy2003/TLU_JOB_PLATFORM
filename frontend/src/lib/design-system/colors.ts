/**
 * Design System — Colors
 * Source: Color.png (Figma design file)
 *
 * Cách dùng:
 *   import { colors } from "@/lib/design-system/colors"
 *   colors.primary[500]   → "#005DDC"
 *   colors.error[500]     → "#DC0000"
 */

// ─── Primary (Blue) ───────────────────────────────────────────────────────────

const primary = {
  50:  "#EEF5FF",
  100: "#DECCFF",  // #BECFF (đọc từ ảnh)
  200: "#80CDFF",
  300: "#6EA8FF",
  400: "#3E8FFF",
  500: "#005DDC",  // ← Brand primary
  600: "#004E67",
  700: "#003E93",
  800: "#063B82",
  900: "#002F6E",
} as const;

// ─── Neutral (Gray) ───────────────────────────────────────────────────────────

const neutral = {
  50:  "#F8F8F8",
  100: "#F4F4F4",
  200: "#EDEDED",
  300: "#CBCBCB",
  400: "#A5A5A5",
  500: "#757575",  // ← Neutral mid
  600: "#515151",
  700: "#353535",
  800: "#282828",
} as const;

// ─── Error (Red) ──────────────────────────────────────────────────────────────

const error = {
  100: "#FFEEEE",
  200: "#FACCCC",
  500: "#DC0000",  // ← Error default
  800: "#840000",
} as const;

// ─── Success (Green) ──────────────────────────────────────────────────────────

const success = {
  100: "#EEFFFD",
  200: "#CCFACC",
  500: "#009E00",  // ← Success default
  800: "#034203",
} as const;

// ─── Warning (Yellow) ─────────────────────────────────────────────────────────

const warning = {
  100: "#FFEBB2",
  500: "#F09E00",  // ← Warning default
  800: "#805E00",
} as const;

// ─── Info (Teal/Cyan) ─────────────────────────────────────────────────────────

const info = {
  100: "#E4FFF9",
  200: "#B8F2F2",
  500: "#00AEAC",  // ← Info default
  800: "#044747",
} as const;

// ─── Semantic aliases ─────────────────────────────────────────────────────────
// Dùng trong code thay vì hardcode hex

export const semantic = {
  // Brand
  brand:            primary[500],
  brandHover:       primary[600],
  brandLight:       primary[50],

  // Text
  textPrimary:      neutral[800],
  textSecondary:    neutral[600],
  textDisabled:     neutral[400],
  textInverse:      "#FFFFFF",
  textLink:         primary[500],
  textLinkHover:    primary[600],

  // Background
  bgBase:           "#FFFFFF",
  bgSubtle:         neutral[50],
  bgMuted:          neutral[100],
  bgDisabled:       neutral[200],

  // Border
  borderDefault:    neutral[200],
  borderStrong:     neutral[300],
  borderFocus:      primary[500],

  // State — Error
  errorDefault:     error[500],
  errorLight:       error[100],
  errorBorder:      error[200],
  errorText:        error[800],

  // State — Success
  successDefault:   success[500],
  successLight:     success[100],
  successBorder:    success[200],
  successText:      success[800],

  // State — Warning
  warningDefault:   warning[500],
  warningLight:     warning[100],
  warningText:      warning[800],

  // State — Info
  infoDefault:      info[500],
  infoLight:        info[100],
  infoBorder:       info[200],
  infoText:         info[800],
} as const;

// ─── Export ───────────────────────────────────────────────────────────────────

export const colors = {
  primary,
  neutral,
  error,
  success,
  warning,
  info,
  semantic,
} as const;

export type Colors    = typeof colors;
export type Primary   = typeof primary;
export type Neutral   = typeof neutral;
export type Semantic  = typeof semantic;
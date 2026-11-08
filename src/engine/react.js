// React export: one typed component per catalogue entry, styled by the same
// classes the tool renders (components.css) and painted only with tokens.css.
// Templates are TSX text; __V__/__VD__/__S__/__SD__ are filled from the catalogue
// (variant and size unions and their defaults), so the types match the system.
import { COMPONENTS } from './catalog.js';

const pascal = (id) => id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join('');

/** Component name per catalogue id (some read better than the plain PascalCase id). */
export const REACT_NAMES = {
  'icon-button': 'IconButton', 'button-group': 'ButtonGroup', fab: 'Fab', 'text-field': 'TextField',
  search: 'SearchField', 'number-input': 'NumberInput', 'tag-input': 'TagInput', otp: 'OtpInput',
  'date-picker': 'DatePicker', 'file-upload': 'FileUpload', radio: 'RadioGroup', segmented: 'SegmentedControl',
  'page-control': 'PageControl', sidebar: 'SideNav', 'inline-edit': 'InlineEdit', 'time-picker': 'TimePicker', 'color-picker': 'ColorPicker', 'context-menu': 'ContextMenu', 'page-banner': 'PageBanner', 'media-card': 'MediaCard', 'product-card': 'ProductCard', 'pricing-card': 'PricingCard', 'profile-card': 'ProfileCard', 'nav-rail': 'NavRail', 'nav-bar': 'BottomNav', topbar: 'TopBar',
  'save-bar': 'SaveBar', progress: 'ProgressBar', 'empty-state': 'EmptyState', 'action-sheet': 'ActionSheet',
  table: 'DataTable', code: 'CodeBlock', stat: 'Stat', kbd: 'Kbd',
};
export const reactName = (id) => REACT_NAMES[id] ?? pascal(id);

const union = (list) => (list?.length ? list.map((x) => `'${x}'`).join(' | ') : 'string');

// ---------------------------------------------------------------------------
// Shared files

const CX = `/** Joins class names, skipping falsy values. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
`;

const ICON_PATHS = {
  check: 'M5 12.5l4.5 4.5L19 7.5', x: 'M6 6l12 12M18 6L6 18', plus: 'M12 5v14M5 12h14', minus: 'M5 12h14',
  chevronDown: 'M6 9l6 6 6-6', chevronRight: 'M9 6l6 6-6 6', chevronLeft: 'M15 6l-6 6 6 6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4', info: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8v.01',
  alert: 'M12 3l9.5 17h-19zM12 10v4M12 17v.01', checkCircle: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 12l3 3 5-6',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z', upload: 'M12 16V4M7 9l5-5 5 5M4 16v4h16v-4',
  file: 'M7 3h7l5 5v13H7zM14 3v5h5', more: 'M5 12v.01M12 12v.01M19 12v.01', clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2', edit: 'M4 20h4L19 9l-4-4L4 16zM14 6l4 4',
};

const ICON = `import type { CSSProperties } from 'react';

const PATHS = ${JSON.stringify(ICON_PATHS, null, 2)} as const;

export type IconName = keyof typeof PATHS;

/** Minimal stroke icons used inside the components. Swap for your icon set if you have one. */
export function Icon({ name, size = 16, strokeWidth = 1.8, style }: { name: IconName; size?: number; strokeWidth?: number; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
      <path d={PATHS[name]} />
    </svg>
  );
}

export function Spinner({ size = 16, label }: { size?: number; label?: string }) {
  return (
    <svg className="spinner" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}
`;

const PROVIDER = `import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from './cx';

export interface DesignSystemProviderProps extends HTMLAttributes<HTMLDivElement> {
  /** Light or dark. Leave undefined to follow the user's system setting. */
  theme?: 'light' | 'dark';
  /** Sub-brand slug (see tokens.css). Leave undefined for the master brand. */
  brand?: string;
  children: ReactNode;
}

/**
 * Scopes the component styles (.ds) and sets theme and brand.
 * Wrap your app once; nest another provider to show a different brand or theme in one area.
 */
export function DesignSystemProvider({ theme, brand, className, children, ...rest }: DesignSystemProviderProps) {
  return (
    <div className={cx('ds', className)} data-theme={theme} data-brand={brand} {...rest}>
      {children}
    </div>
  );
}
`;

// Glue for production elements where the tool's previews used plain spans.
const GLUE_CSS = `
/* ---- React glue: real, accessible elements where the previews used plain spans ---- */
.ds [hidden] { display: none !important; }
.ds button.chip { font-family: inherit; }
.ds .input select { all: unset; flex: 1; min-width: 0; cursor: pointer; }
.ds .input.select svg { pointer-events: none; }
.ds .cal button { all: unset; height: var(--date-picker-cell-size, 36px); display: grid; place-items: center; border-radius: var(--radius-selectors); cursor: pointer; }
.ds .cal button:hover { background: var(--bg-hover); }
.ds .cal button.sel:hover { background: var(--primary-solid-hover); }
.ds .cal button.out { color: var(--text-disabled); }
.ds .cal button:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 1px; }
.ds .otp span:focus-within { border-color: var(--primary-solid); box-shadow: 0 0 0 3px var(--primary-subtle); }
.ds .otp input { all: unset; width: 100%; height: 100%; text-align: center; font: inherit; }
.ds .crumbs ol { display: flex; gap: 8px; align-items: center; list-style: none; margin: 0; padding: 0; }
.ds .crumbs li { display: inline-flex; align-items: center; gap: 8px; }
.ds .slider input[type="range"] { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.ds .slider.range input[type="range"] { pointer-events: none; }
.ds .slider.range input[type="range"]::-webkit-slider-thumb { pointer-events: auto; }
.ds .slider.range input[type="range"]::-moz-range-thumb { pointer-events: auto; }
.ds .slider input:disabled { cursor: default; }
.ds .slider input.a:focus-visible ~ .track .thumb.a, .ds .slider input.b:focus-visible ~ .track .thumb.b { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.ds .acc button.hd { all: unset; box-sizing: border-box; width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 12px 0; font-weight: 600; font-size: var(--text-small-size); cursor: pointer; }
.ds .acc button.hd:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
.ds .menu [role="menuitem"]:focus { outline: none; background: var(--bg-hover); }
.ds .tip-wrap, .ds .pop-wrap { position: relative; display: inline-flex; }
.ds .tip-wrap > .tooltip { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); white-space: nowrap; z-index: 50; pointer-events: none; }
.ds .pop-wrap > .popover { position: absolute; top: calc(100% + 8px); left: 0; z-index: 50; }
.ds .scrim.fixed { position: fixed; inset: 0; border-radius: 0; z-index: 100; }
.ds .scrim.fixed.sheet { display: flex; padding: 0; place-items: initial; }
.ds .scrim.fixed.sheet.bottom { align-items: flex-end; }
.ds .drawer.bottom { margin: 0; width: 100%; height: auto; max-height: 80vh; border-left: 0; border-top: 1px solid var(--border-subtle); border-radius: var(--radius-boxes) var(--radius-boxes) 0 0; }
.ds .combo { position: relative; }
.ds .combo > .menu { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 50; max-height: 240px; overflow: auto; }
.ds .combo [role="option"][aria-selected="true"] { font-weight: 600; }
.ds .file-input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.ds .vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;

// ---------------------------------------------------------------------------
// Component templates (TSX). Every component accepts className and spreads the
// rest of the native props onto its root element where that makes sense.

const T = {};

T.button = String.raw`import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../cx';
import { Spinner } from '../Icon';

export type ButtonVariant = __V__;
export type ButtonSize = __S__;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner and blocks clicks; the label stays for screen readers. */
  loading?: boolean;
  iconStart?: ReactNode;
  iconEnd?: ReactNode;
  /** Full width. */
  block?: boolean;
}

/** One primary button per view; secondary, outline and ghost for the rest. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = '__VD__', size = '__SD__', loading = false, iconStart, iconEnd, block, className, children, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} className={cx('btn', variant, size !== 'md' && size, block && 'block', className)}
      disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading ? <Spinner size={14} /> : iconStart}
      {children}
      {iconEnd}
    </button>
  );
});
`;

T['icon-button'] = String.raw`import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../cx';

export type IconButtonVariant = __V__;
export type IconButtonSize = __S__;
const CLASS: Record<string, string> = { solid: 'primary', outline: 'outline', ghost: 'ghost' };

export interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  icon: ReactNode;
  /** Required: an icon alone has no accessible name. */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon, label, variant = '__VD__', size = '__SD__', className, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label}
      className={cx('btn icon', CLASS[variant] ?? variant, size !== 'md' && size, className)} {...rest}>
      {icon}
    </button>
  );
});
`;

T['button-group'] = String.raw`import { cx } from '../cx';

export interface ButtonGroupOption { value: string; label: string; disabled?: boolean }
export interface ButtonGroupProps {
  options: ButtonGroupOption[];
  /** Selected values. Pass one value for single choice. */
  value: string[];
  onChange: (value: string[]) => void;
  multiple?: boolean;
  variant?: __V__;
  label?: string;
  className?: string;
}

export function ButtonGroup({ options, value, onChange, multiple = false, variant = '__VD__', label, className }: ButtonGroupProps) {
  const toggle = (v: string) => {
    if (!multiple) return onChange([v]);
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <div role="group" aria-label={label} className={cx(variant === 'spaced' ? 'row' : 'btn-group', className)}>
      {options.map((o) => (
        <button key={o.value} type="button" disabled={o.disabled} aria-pressed={value.includes(o.value)}
          className={cx('btn outline sm', value.includes(o.value) && 'on')} onClick={() => toggle(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
`;

T.link = String.raw`import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export type LinkVariant = __V__;
export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> { variant?: LinkVariant }

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link({ variant = '__VD__', className, children, ...rest }, ref) {
  return (
    <a ref={ref} className={cx('link', variant !== 'inline' && variant, className)} {...rest}>
      {children}
      {variant === 'standalone' && <Icon name="chevronRight" size={12} />}
    </a>
  );
});
`;

T.fab = String.raw`import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface FabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible name; also shown as text in the extended variant. */
  label: string;
  icon?: ReactNode;
  variant?: __V__;
}

/** The screen's main creative action, floating above content. Use at most one. */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab({ label, icon, variant = '__VD__', className, type = 'button', ...rest }, ref) {
  const extended = variant === 'extended';
  return (
    <button ref={ref} type={type} aria-label={extended ? undefined : label} className={cx('btn fab icon', extended && 'ext', className)} {...rest}>
      {icon ?? <Icon name="plus" size={20} />}
      {extended && label}
    </button>
  );
});
`;

T.toolbar = String.raw`import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '../cx';

export interface ToolbarProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  variant?: __V__;
  children: ReactNode;
}

/** Groups related actions. Put IconButtons inside; use ToolbarDivider between groups. */
export function Toolbar({ label, variant = '__VD__', className, children, ...rest }: ToolbarProps) {
  return <div role="toolbar" aria-label={label} className={cx('toolbar', variant === 'floating' && 'floating', className)} {...rest}>{children}</div>;
}

export function ToolbarDivider() {
  return <span className="vdiv" role="separator" aria-orientation="vertical" />;
}
`;

T['text-field'] = String.raw`import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cx } from '../cx';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  /** Help text under the field. Replaced by the error when there is one. */
  hint?: string;
  error?: string;
  variant?: __V__;
  size?: __S__;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, hint, error, variant = '__VD__', size = '__SD__', id, className, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const help = error || hint;
  return (
    <div className={cx('field', className)}>
      <label className="label" htmlFor={fid}>{label}</label>
      <input ref={ref} id={fid} className={cx('input', variant === 'filled' && 'filled', size !== 'md' && size, error && 'error')}
        aria-invalid={error ? true : undefined} aria-describedby={help ? fid + '-help' : undefined} {...rest} />
      {help && <span id={fid + '-help'} className={cx('help', error && 'err')}>{help}</span>}
    </div>
  );
});
`;

T.textarea = String.raw`import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cx } from '../cx';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ label, hint, error, id, className, rows = 4, ...rest }, ref) {
  const auto = useId();
  const fid = id ?? auto;
  const help = error || hint;
  return (
    <div className={cx('field', className)}>
      <label className="label" htmlFor={fid}>{label}</label>
      <textarea ref={ref} id={fid} rows={rows} className={cx('input', error && 'error')} aria-invalid={error ? true : undefined}
        aria-describedby={help ? fid + '-help' : undefined} {...rest} />
      {help && <span id={fid + '-help'} className={cx('help', error && 'err')}>{help}</span>}
    </div>
  );
});
`;

T.select = String.raw`import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface SelectOption { value: string; label: string; disabled?: boolean }
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
  error?: string;
  variant?: __V__;
  size?: __S__;
}

/** Native select (best on mobile and for accessibility) dressed with the field styles. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, options, placeholder, hint, error, variant = '__VD__', size = '__SD__', id, className, disabled, ...rest },
  ref,
) {
  const auto = useId();
  const fid = id ?? auto;
  const help = error || hint;
  return (
    <div className={cx('field', className)}>
      <label className="label" htmlFor={fid}>{label}</label>
      <div className={cx('input select', variant === 'filled' && 'filled', size !== 'md' && size, error && 'error', disabled && 'disabled')}>
        <select ref={ref} id={fid} disabled={disabled} aria-invalid={error ? true : undefined} aria-describedby={help ? fid + '-help' : undefined} {...rest}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
        </select>
        <Icon name="chevronDown" size={16} />
      </div>
      {help && <span id={fid + '-help'} className={cx('help', error && 'err')}>{help}</span>}
    </div>
  );
});
`;

T.combobox = String.raw`import { useId, useMemo, useState, type KeyboardEvent } from 'react';
import { cx } from '../cx';

export interface ComboboxProps {
  label: string;
  options: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  /** Text shown when nothing matches. */
  emptyText?: string;
  className?: string;
}

/** Text input with a filtered list (ARIA combobox pattern): arrows move, Enter picks, Escape closes. */
export function Combobox({ label, options, value, onChange, placeholder, emptyText = 'No results', className }: ComboboxProps) {
  const id = useId();
  const [query, setQuery] = useState(value ?? '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const matches = useMemo(() => options.filter((o) => o.toLowerCase().includes(query.toLowerCase())), [options, query]);
  const pick = (o: string) => { onChange(o); setQuery(o); setOpen(false); };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, matches.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter' && open && matches[active]) { e.preventDefault(); pick(matches[active]); }
    else if (e.key === 'Escape') setOpen(false);
  };
  const mark = (o: string) => {
    const i = o.toLowerCase().indexOf(query.toLowerCase());
    if (!query || i < 0) return o;
    return <>{o.slice(0, i)}<b>{o.slice(i, i + query.length)}</b>{o.slice(i + query.length)}</>;
  };
  return (
    <div className={cx('field combo', className)}>
      <label className="label" htmlFor={id}>{label}</label>
      <div className={cx('input', open && 'focus')}>
        <input id={id} role="combobox" aria-expanded={open} aria-controls={id + '-list'} aria-autocomplete="list"
          aria-activedescendant={open && matches[active] ? id + '-' + active : undefined} value={query} placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); if (!e.target.value) onChange(null); }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 120)} onKeyDown={onKey} />
      </div>
      {open && (
        <div className="menu" role="listbox" id={id + '-list'} aria-label={label}>
          {matches.length === 0 && <div aria-disabled="true">{emptyText}</div>}
          {matches.map((o, i) => (
            <div key={o} id={id + '-' + i} role="option" aria-selected={o === value} className={cx(i === active && 'hover')}
              onMouseDown={(e) => { e.preventDefault(); pick(o); }} onMouseEnter={() => setActive(i)}>
              {mark(o)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;

T.search = String.raw`import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Accessible name for the field. */
  label?: string;
  /** Keyboard shortcut hint, e.g. "⌘K". Wiring the shortcut is up to the app. */
  shortcut?: string;
  variant?: __V__;
}

export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { label = 'Search', shortcut, variant = '__VD__', className, ...rest },
  ref,
) {
  return (
    <div className={cx('input with-icon', variant === 'filled' && 'filled', className)}>
      <Icon name="search" size={16} />
      <input ref={ref} type="search" aria-label={label} {...rest} />
      {shortcut && <kbd>{shortcut}</kbd>}
    </div>
  );
});
`;

T['number-input'] = String.raw`import { useId } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

export function NumberInput({ label, value, onChange, min = -Infinity, max = Infinity, step = 1, disabled, className }: NumberInputProps) {
  const id = useId();
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  return (
    <div className={cx('field', className)}>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="num">
        <input id={id} className="input" inputMode="decimal" value={Number.isFinite(value) ? value : ''} disabled={disabled}
          onChange={(e) => { const n = Number(e.target.value); if (!Number.isNaN(n)) onChange(clamp(n)); }}
          onKeyDown={(e) => { if (e.key === 'ArrowUp') { e.preventDefault(); onChange(clamp(value + step)); } if (e.key === 'ArrowDown') { e.preventDefault(); onChange(clamp(value - step)); } }} />
        <button type="button" className="btn outline icon" aria-label="Decrease" disabled={disabled || value <= min} onClick={() => onChange(clamp(value - step))}><Icon name="minus" size={14} /></button>
        <button type="button" className="btn outline icon" aria-label="Increase" disabled={disabled || value >= max} onClick={() => onChange(clamp(value + step))}><Icon name="plus" size={14} /></button>
      </div>
    </div>
  );
}
`;

T['tag-input'] = String.raw`import { useId, useState } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface TagInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

/** Type and press Enter or comma to add; Backspace on an empty field removes the last tag. */
export function TagInput({ label, value, onChange, placeholder, className }: TagInputProps) {
  const id = useId();
  const [text, setText] = useState('');
  const add = () => { const t = text.trim(); if (t && !value.includes(t)) onChange([...value, t]); setText(''); };
  return (
    <div className={cx('field', className)}>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="input tokens">
        {value.map((t) => (
          <span key={t} className="chip static">{t}
            <button type="button" aria-label={'Remove ' + t} onClick={() => onChange(value.filter((x) => x !== t))}><Icon name="x" size={11} /></button>
          </span>
        ))}
        <input id={id} value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)} onBlur={add}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
            if (e.key === 'Backspace' && !text && value.length) onChange(value.slice(0, -1));
          }} />
      </div>
    </div>
  );
}
`;

T.otp = String.raw`import { useRef } from 'react';
import { cx } from '../cx';

export interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label?: string;
  error?: boolean;
  className?: string;
}

/** One box per digit; typing advances, Backspace goes back, pasting fills every box. */
export function OtpInput({ value, onChange, length = 6, label = 'Verification code', error, className }: OtpInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const set = (i: number, d: string) => {
    const next = digits.slice(); next[i] = d; onChange(next.join('').slice(0, length));
  };
  return (
    <div className={cx('otp', className)} role="group" aria-label={label}>
      {digits.map((d, i) => (
        <span key={i} style={error ? { borderColor: 'var(--critical-solid)' } : undefined}>
          <input ref={(el) => { refs.current[i] = el; }} value={d} inputMode="numeric" autoComplete={i === 0 ? 'one-time-code' : 'off'}
            maxLength={1} aria-label={'Digit ' + (i + 1)} aria-invalid={error || undefined}
            onChange={(e) => { const c = e.target.value.replace(/\D/g, '').slice(-1); set(i, c); if (c) refs.current[i + 1]?.focus(); }}
            onKeyDown={(e) => { if (e.key === 'Backspace' && !d) refs.current[i - 1]?.focus(); }}
            onPaste={(e) => { e.preventDefault(); const p = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length); onChange(p); refs.current[Math.min(p.length, length - 1)]?.focus(); }} />
        </span>
      ))}
    </div>
  );
}
`;

T['date-picker'] = String.raw`import { useMemo, useState } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

type Range = [Date | null, Date | null];
export interface DatePickerProps {
  /** single: one date. range: start and end. */
  mode?: __V__;
  value: Date | null | Range;
  onChange: (value: Date | Range) => void;
  /** Any BCP 47 locale, e.g. "es-ES". */
  locale?: string;
  /** 0 = Sunday, 1 = Monday. */
  weekStartsOn?: 0 | 1;
  className?: string;
}

const same = (a: Date | null, b: Date | null) => !!a && !!b && a.toDateString() === b.toDateString();

export function DatePicker({ mode = '__VD__', value, onChange, locale = 'en-US', weekStartsOn = 1, className }: DatePickerProps) {
  const first = mode === 'range' ? (value as Range)?.[0] : (value as Date | null);
  const [view, setView] = useState(() => { const d = first ?? new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const today = new Date();
  const days = useMemo(() => {
    const start = new Date(view);
    start.setDate(1 - ((view.getDay() - weekStartsOn + 7) % 7));
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [view, weekStartsOn]);
  const dow = useMemo(() => days.slice(0, 7).map((d) => d.toLocaleDateString(locale, { weekday: 'narrow' })), [days, locale]);
  const [a, b] = mode === 'range' ? ((value as Range) ?? [null, null]) : [value as Date | null, null];
  const pick = (d: Date) => {
    if (mode !== 'range') return onChange(d);
    if (!a || b) return onChange([d, null]);
    onChange(d < a ? [d, a] : [a, d]);
  };
  const move = (n: number) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));
  return (
    <div className={cx('card', className)} style={{ padding: 12, width: 'fit-content' }}>
      <div className="row" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
        <b className="t-small" aria-live="polite">{view.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</b>
        <div className="row" style={{ gap: 4 }}>
          <button type="button" className="btn ghost icon sm" aria-label="Previous month" onClick={() => move(-1)}><Icon name="chevronLeft" size={14} /></button>
          <button type="button" className="btn ghost icon sm" aria-label="Next month" onClick={() => move(1)}><Icon name="chevronRight" size={14} /></button>
        </div>
      </div>
      <div className="cal" role="grid">
        {dow.map((d, i) => <span key={i} className="dow" aria-hidden="true">{d}</span>)}
        {days.map((d) => {
          const sel = same(d, a) || same(d, b);
          const inRange = !!a && !!b && d > a && d < b;
          return (
            <button key={d.toISOString()} type="button" role="gridcell" aria-selected={sel}
              aria-label={d.toLocaleDateString(locale, { dateStyle: 'full' })}
              className={cx(d.getMonth() !== view.getMonth() && 'out', same(d, today) && 'today', sel && 'sel', inRange && 'rng')}
              onClick={() => pick(d)}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
`;

T['file-upload'] = String.raw`import { useId, useRef, useState, type DragEvent } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface FileUploadProps {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  /** e.g. "PDF, PNG up to 10 MB" */
  hint?: string;
  variant?: __V__;
  className?: string;
}

/** Drop zone with a real file input behind it, so it works with keyboard and screen readers. */
export function FileUpload({ onFiles, accept, multiple = true, hint, variant = '__VD__', className }: FileUploadProps) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const drop = (e: DragEvent) => { e.preventDefault(); setDrag(false); onFiles(Array.from(e.dataTransfer.files)); };
  const field = <input ref={input} id={id} className="file-input" type="file" accept={accept} multiple={multiple} onChange={(e) => onFiles(Array.from(e.target.files ?? []))} />;
  if (variant === 'button') {
    return <span className={className}>{field}<button type="button" className="btn outline" onClick={() => input.current?.click()}><Icon name="upload" size={14} />Upload</button></span>;
  }
  return (
    <div className={cx('drop', drag && 'drag', className)} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop}>
      {field}
      <Icon name="upload" size={20} />
      <b>Drop files or <label htmlFor={id} className="link">browse</label></b>
      {hint && <span className="help">{hint}</span>}
    </div>
  );
}
`;

T.slider = String.raw`import { cx } from '../cx';

type Value = number | [number, number];
export interface SliderProps {
  label: string;
  value: Value;
  onChange: (value: Value) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}

/** Native range inputs under the styled track: keyboard, touch and screen readers work out of the box. */
export function Slider({ label, value, onChange, min = 0, max = 100, step = 1, disabled, className }: SliderProps) {
  const range = Array.isArray(value);
  const [lo, hi] = range ? value : [min, value];
  const pct = (n: number) => ((n - min) / (max - min)) * 100;
  return (
    <div className={cx('slider', range && 'range', className)}>
      {range && <input className="a" type="range" aria-label={label + ' (min)'} min={min} max={max} step={step} value={lo} disabled={disabled}
        onChange={(e) => onChange([Math.min(Number(e.target.value), hi), hi])} />}
      <input className="b" type="range" aria-label={range ? label + ' (max)' : label} min={min} max={max} step={step} value={hi} disabled={disabled}
        onChange={(e) => onChange(range ? [lo, Math.max(Number(e.target.value), lo)] : Number(e.target.value))} />
      <div className="track" aria-hidden="true">
        <div className="fill" style={{ left: pct(lo) + '%', width: pct(hi) - pct(lo) + '%' }} />
        {range && <div className="thumb a" style={{ left: pct(lo) + '%' }} />}
        <div className="thumb b" style={{ left: pct(hi) + '%' }} />
      </div>
    </div>
  );
}
`;

T.checkbox = String.raw`import { useEffect, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
}

export function Checkbox({ label, checked, onChange, indeterminate = false, disabled, className, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  return (
    <label className={cx('check', className)}>
      <input ref={ref} type="checkbox" className="vh" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} {...rest} />
      <span className={cx('box', (checked || indeterminate) && 'on', disabled && 'dis')} aria-hidden="true">
        {checked ? <Icon name="check" size={12} strokeWidth={3} /> : indeterminate ? <Icon name="minus" size={12} strokeWidth={3} /> : null}
      </span>
      <span style={disabled ? { color: 'var(--text-disabled)' } : undefined}>{label}</span>
    </label>
  );
}
`;

T.radio = String.raw`import { useId } from 'react';
import { cx } from '../cx';

export interface RadioOption { value: string; label: string; description?: string; disabled?: boolean }
export interface RadioGroupProps {
  label: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  /** default: compact list. card: each option in a selectable card. */
  variant?: __V__;
  className?: string;
}

export function RadioGroup({ label, options, value, onChange, variant = '__VD__', className }: RadioGroupProps) {
  const name = useId();
  return (
    <fieldset className={cx('col', className)} style={{ border: 0, margin: 0, padding: 0, gap: variant === 'card' ? 8 : 12 }}>
      <legend className="label" style={{ marginBottom: 8 }}>{label}</legend>
      {options.map((o) => {
        const on = o.value === value;
        const input = <input type="radio" className="vh" name={name} value={o.value} checked={on} disabled={o.disabled} onChange={() => onChange(o.value)} />;
        return variant === 'card' ? (
          <label key={o.value} className={cx('radio-card', on && 'on')} style={{ cursor: o.disabled ? 'default' : 'pointer' }}>
            {input}<span className={cx('box radio', on && 'on')} aria-hidden="true" />
            <span><b className="t-small">{o.label}</b>{o.description && <span className="help" style={{ display: 'block' }}>{o.description}</span>}</span>
          </label>
        ) : (
          <label key={o.value} className="check">
            {input}<span className={cx('box radio', on && 'on', o.disabled && 'dis')} aria-hidden="true" />
            <span style={o.disabled ? { color: 'var(--text-disabled)' } : undefined}>{o.label}</span>
          </label>
        );
      })}
    </fieldset>
  );
}
`;

T.switch = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface SwitchProps {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

/** For settings that apply at once. For choices that wait for a Save button, use Checkbox. */
export function Switch({ label, checked, onChange, disabled, className }: SwitchProps) {
  return (
    <label className={cx('check', className)} style={disabled ? { opacity: 0.5, cursor: 'default' } : undefined}>
      <button type="button" role="switch" aria-checked={checked} disabled={disabled} className={cx('switch', checked && 'on')}
        style={{ border: 0, padding: 0 }} onClick={() => onChange(!checked)} />
      <span>{label}</span>
    </label>
  );
}
`;

T.segmented = String.raw`import { cx } from '../cx';

export interface SegmentedControlProps {
  label: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/** Switches between views of the same content (2 to 5 options). */
export function SegmentedControl({ label, options, value, onChange, className }: SegmentedControlProps) {
  return (
    <div className={cx('seg', className)} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={o.value === value} className={cx(o.value === value && 'on')} onClick={() => onChange(o.value)}>{o.label}</button>
      ))}
    </div>
  );
}
`;

T.chip = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface ChipProps {
  children: ReactNode;
  /** filter: toggles on and off. input: has a remove button. static: just a label. */
  variant?: __V__;
  selected?: boolean;
  onToggle?: (selected: boolean) => void;
  onRemove?: () => void;
  className?: string;
}

export function Chip({ children, variant = '__VD__', selected = false, onToggle, onRemove, className }: ChipProps) {
  if (variant === 'static') return <span className={cx('chip static', className)}>{children}</span>;
  if (variant === 'input') {
    return (
      <span className={cx('chip', className)}>{children}
        <button type="button" aria-label="Remove" onClick={onRemove} style={{ all: 'unset', display: 'grid', cursor: 'pointer' }}><Icon name="x" size={12} /></button>
      </span>
    );
  }
  return (
    <button type="button" aria-pressed={selected} className={cx('chip', selected && 'on', className)} onClick={() => onToggle?.(!selected)}>
      {selected && <Icon name="check" size={12} strokeWidth={2.5} />}{children}
    </button>
  );
}
`;

T.rating = String.raw`import { useState } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  max?: number;
  /** input: the user rates. display: read-only. */
  variant?: __V__;
  label?: string;
  className?: string;
}

export function Rating({ value, onChange, max = 5, variant = '__VD__', label = 'Rating', className }: RatingProps) {
  const [hover, setHover] = useState(0);
  const readOnly = variant === 'display' || !onChange;
  const shown = hover || value;
  return (
    <div className={cx('rating', className)} role={readOnly ? 'img' : 'radiogroup'} aria-label={label + ': ' + value + ' / ' + max} onMouseLeave={() => setHover(0)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((i) => (
        <button key={i} type="button" className={cx(i <= shown && 'on')} disabled={readOnly} role={readOnly ? undefined : 'radio'}
          aria-checked={readOnly ? undefined : i === value} aria-label={String(i)} onMouseEnter={() => !readOnly && setHover(i)} onClick={() => onChange?.(i)}>
          <Icon name="star" size={20} />
        </button>
      ))}
    </div>
  );
}
`;

T.tabs = String.raw`import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../cx';

export interface TabItem { value: string; label: string; disabled?: boolean; content?: ReactNode }
export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  variant?: __V__;
  label?: string;
  className?: string;
}

/** ARIA tabs: arrow keys move between tabs; the panel shows the selected item's content. */
export function Tabs({ items, value, onChange, variant = '__VD__', label, className }: TabsProps) {
  const id = useId();
  const list = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    const enabled = items.filter((t) => !t.disabled);
    const i = enabled.findIndex((t) => t.value === value);
    const next = e.key === 'ArrowRight' ? enabled[(i + 1) % enabled.length] : e.key === 'ArrowLeft' ? enabled[(i - 1 + enabled.length) % enabled.length] : null;
    if (next) { e.preventDefault(); onChange(next.value); (list.current?.querySelector('#' + CSS.escape(id + next.value)) as HTMLElement | null)?.focus(); }
  };
  const current = items.find((t) => t.value === value);
  return (
    <div className={className}>
      <div ref={list} role="tablist" aria-label={label} className={cx('tabs', variant === 'pill' && 'pill')} onKeyDown={onKey}>
        {items.map((t) => (
          <button key={t.value} id={id + t.value} type="button" role="tab" aria-selected={t.value === value} aria-controls={id + 'panel'}
            tabIndex={t.value === value ? 0 : -1} disabled={t.disabled} className={cx(t.value === value && 'on')} onClick={() => onChange(t.value)}>
            {t.label}
          </button>
        ))}
      </div>
      {current?.content !== undefined && <div role="tabpanel" id={id + 'panel'} aria-labelledby={id + value} style={{ paddingTop: 16 }}>{current.content}</div>}
    </div>
  );
}
`;

T.breadcrumb = String.raw`import { Fragment } from 'react';
import { Icon } from '../Icon';

export interface BreadcrumbItem { label: string; href?: string }

/** The last item is the current page and is not a link. */
export function Breadcrumb({ items, label = 'Breadcrumb' }: { items: BreadcrumbItem[]; label?: string }) {
  return (
    <nav className="crumbs" aria-label={label}>
      <ol>
        {items.map((it, i) => (
          <Fragment key={i}>
            <li>{i === items.length - 1 ? <b aria-current="page">{it.label}</b> : <a className="link subtle" href={it.href}>{it.label}</a>}</li>
            {i < items.length - 1 && <li aria-hidden="true"><Icon name="chevronRight" size={12} /></li>}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
`;

T.pagination = String.raw`import { Icon } from '../Icon';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  variant?: __V__;
  /** Labels for the simple variant. */
  previousLabel?: string;
  nextLabel?: string;
}

function pages(page: number, count: number): Array<number | 'gap'> {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const set = [1, page - 1, page, page + 1, count].filter((p) => p >= 1 && p <= count);
  const out: Array<number | 'gap'> = [];
  [...new Set(set)].sort((a, b) => a - b).forEach((p, i, arr) => { if (i && p - arr[i - 1] > 1) out.push('gap'); out.push(p); });
  return out;
}

export function Pagination({ page, pageCount, onChange, variant = '__VD__', previousLabel = 'Previous', nextLabel = 'Next' }: PaginationProps) {
  if (variant === 'simple') {
    return (
      <nav className="row" aria-label="Pagination">
        <button type="button" className="btn outline sm" disabled={page <= 1} onClick={() => onChange(page - 1)}><Icon name="chevronLeft" size={14} />{previousLabel}</button>
        <span className="t-small muted" aria-live="polite">{page} / {pageCount}</span>
        <button type="button" className="btn outline sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>{nextLabel}<Icon name="chevronRight" size={14} /></button>
      </nav>
    );
  }
  return (
    <nav className="pager" aria-label="Pagination">
      <button type="button" aria-label={previousLabel} disabled={page <= 1} onClick={() => onChange(page - 1)}>‹</button>
      {pages(page, pageCount).map((p, i) => p === 'gap'
        ? <span key={'g' + i} aria-hidden="true" style={{ minWidth: 32, display: 'grid', placeItems: 'center' }}>…</span>
        : <button key={p} type="button" className={p === page ? 'on' : undefined} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>)}
      <button type="button" aria-label={nextLabel} disabled={page >= pageCount} onClick={() => onChange(page + 1)}>›</button>
    </nav>
  );
}
`;

T['page-control'] = String.raw`export interface PageControlProps { count: number; index: number; onChange: (index: number) => void; label?: string }

/** Dots for paged content such as carousels and onboarding. */
export function PageControl({ count, index, onChange, label = 'Pages' }: PageControlProps) {
  return (
    <div className="pagectl" role="tablist" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <button key={i} type="button" role="tab" aria-selected={i === index} aria-label={String(i + 1)} className={i === index ? 'on' : undefined} onClick={() => onChange(i)} />
      ))}
    </div>
  );
}
`;

T.sidebar = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface SideNavItem { id: string; label: string; href?: string; icon?: ReactNode; count?: number }
export interface SideNavProps {
  items: SideNavItem[];
  activeId: string;
  onNavigate?: (id: string) => void;
  title?: string;
  label?: string;
  className?: string;
}

export function SideNav({ items, activeId, onNavigate, title, label = 'Main', className }: SideNavProps) {
  return (
    <nav className={cx('nav', className)} aria-label={label} style={{ maxWidth: 'var(--sidebar-width, 240px)' }}>
      {title && <div className="h">{title}</div>}
      {items.map((it) => (
        <a key={it.id} href={it.href ?? '#'} className={cx(it.id === activeId && 'on')} aria-current={it.id === activeId ? 'page' : undefined}
          onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(it.id); } }}>
          {it.icon}{it.label}{it.count != null && <span className="count">{it.count}</span>}
        </a>
      ))}
    </nav>
  );
}
`;

T['nav-rail'] = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface NavRailItem { id: string; label: string; icon: ReactNode }
export interface NavRailProps {
  items: NavRailItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  /** Optional action on top, usually a Fab. */
  action?: ReactNode;
  label?: string;
  className?: string;
}

/** Tablet and desktop navigation for 3 to 7 destinations. */
export function NavRail({ items, activeId, onNavigate, action, label = 'Main', className }: NavRailProps) {
  return (
    <nav className={cx('rail-c', className)} aria-label={label}>
      {action}
      {items.map((it) => (
        <button key={it.id} type="button" className={cx(it.id === activeId && 'on')} aria-current={it.id === activeId ? 'page' : undefined} onClick={() => onNavigate(it.id)}>
          <span className="pill">{it.icon}</span>{it.label}
        </button>
      ))}
    </nav>
  );
}
`;

T['nav-bar'] = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface BottomNavItem { id: string; label: string; icon: ReactNode; badge?: number }
export interface BottomNavProps { items: BottomNavItem[]; activeId: string; onNavigate: (id: string) => void; label?: string; className?: string }

/** Mobile navigation for 3 to 5 top-level destinations. */
export function BottomNav({ items, activeId, onNavigate, label = 'Main', className }: BottomNavProps) {
  return (
    <nav className={cx('navbar', className)} aria-label={label}>
      {items.map((it) => (
        <button key={it.id} type="button" className={cx(it.id === activeId && 'on')} aria-current={it.id === activeId ? 'page' : undefined} onClick={() => onNavigate(it.id)}>
          <span className="pill">{it.icon}{it.badge ? <span className="badge solid sm dot-badge">{it.badge}</span> : null}</span>{it.label}
        </button>
      ))}
    </nav>
  );
}
`;

T.topbar = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface TopBarProps {
  title: ReactNode;
  logo?: ReactNode;
  /** Usually a SearchField. */
  children?: ReactNode;
  /** Right side: actions, avatar. */
  actions?: ReactNode;
  className?: string;
}

export function TopBar({ title, logo, children, actions, className }: TopBarProps) {
  return (
    <header className={cx('topbar', className)}>
      {logo ?? <span className="logo" aria-hidden="true" />}
      <b className="t-small">{title}</b>
      {children}
      {actions && <div className="row" style={{ marginLeft: 'auto' }}>{actions}</div>}
    </header>
  );
}
`;

T.stepper = String.raw`import { Fragment } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface StepperProps { steps: string[]; current: number; label?: string; className?: string }

/** Progress through a multi-step task. current is 0-based. */
export function Stepper({ steps, current, label = 'Progress', className }: StepperProps) {
  return (
    <ol className={cx('steps', className)} aria-label={label} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {steps.map((s, i) => (
        <Fragment key={s}>
          <li className={cx('dot', i < current && 'done', i === current && 'cur')} aria-current={i === current ? 'step' : undefined} title={s}>
            {i < current ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}
            <span className="vh">{s}{i < current ? ' (done)' : ''}</span>
          </li>
          {i < steps.length - 1 && <li className={cx('line', i < current && 'done')} aria-hidden="true" />}
        </Fragment>
      ))}
    </ol>
  );
}
`;

T.menu = String.raw`import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../cx';

export type MenuEntry = { id: string; label: string; icon?: ReactNode; shortcut?: string; danger?: boolean; disabled?: boolean } | 'separator';
export interface MenuProps { items: MenuEntry[]; onSelect: (id: string) => void; label?: string; className?: string }

/** Menu panel (ARIA menu): arrows move, Enter selects. Place it in a Popover or ContextMenu. */
export function Menu({ items, onSelect, label = 'Menu', className }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    const els = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); els[(i + 1) % els.length]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); els[(i - 1 + els.length) % els.length]?.focus(); }
  };
  return (
    <div ref={ref} className={cx('menu', className)} role="menu" aria-label={label} onKeyDown={onKey}>
      {items.map((it, i) => it === 'separator' ? <hr key={'s' + i} /> : (
        <div key={it.id} role="menuitem" tabIndex={-1} aria-disabled={it.disabled || undefined} className={cx(it.danger && 'danger')}
          style={it.disabled ? { opacity: 0.5, cursor: 'default' } : undefined}
          onClick={() => !it.disabled && onSelect(it.id)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !it.disabled) { e.preventDefault(); onSelect(it.id); } }}>
          {it.icon}{it.label}{it.shortcut && <kbd>{it.shortcut}</kbd>}
        </div>
      ))}
    </div>
  );
}
`;

T.alert = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';
import { Icon, type IconName } from '../Icon';

export type AlertTone = __V__;
const ICON: Record<string, IconName> = { info: 'info', success: 'checkCircle', warning: 'alert', critical: 'alert' };

export interface AlertProps { tone?: AlertTone; title?: ReactNode; children?: ReactNode; onDismiss?: () => void; className?: string }

/** Inline message about the page or a section. Critical alerts are announced at once. */
export function Alert({ tone = '__VD__', title, children, onDismiss, className }: AlertProps) {
  return (
    <div className={cx('alert', tone, className)} role={tone === 'critical' ? 'alert' : 'status'}>
      <Icon name={ICON[tone] ?? 'info'} size={16} />
      <div style={{ flex: 1 }}>{title && <b>{title}</b>}{children}</div>
      {onDismiss && <button type="button" className="btn ghost icon sm" aria-label="Dismiss" onClick={onDismiss} style={{ color: 'inherit' }}><Icon name="x" size={14} /></button>}
    </div>
  );
}
`;

T.toast = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface ToastProps { tone?: __V__; title: ReactNode; description?: ReactNode; action?: ReactNode; onClose?: () => void; className?: string }

/** Short confirmation after an action. Show it in a fixed region; keep it for at least 5 s. */
export function Toast({ tone = '__VD__', title, description, action, onClose, className }: ToastProps) {
  return (
    <div className={cx('toast', tone, className)} role={tone === 'critical' ? 'alert' : 'status'}>
      {tone !== 'neutral' && <span className="ic"><Icon name={tone === 'critical' ? 'alert' : 'checkCircle'} size={18} /></span>}
      <div style={{ flex: 1 }}><b>{title}</b>{description && <div className="muted">{description}</div>}{action}</div>
      {onClose && <button type="button" className="btn ghost icon sm" aria-label="Close" onClick={onClose}><Icon name="x" size={14} /></button>}
    </div>
  );
}
`;

T['save-bar'] = String.raw`import { Icon, Spinner } from '../Icon';

export interface SaveBarProps { message?: string; onSave: () => void; onDiscard: () => void; saving?: boolean; saveLabel?: string; discardLabel?: string }

/** Appears while a form has unsaved changes. */
export function SaveBar({ message = 'Unsaved changes', onSave, onDiscard, saving = false, saveLabel = 'Save', discardLabel = 'Discard' }: SaveBarProps) {
  return (
    <div className="savebar" role="region" aria-label={message}>
      <span className="row" style={{ gap: 8 }}><Icon name="alert" size={16} />{message}</span>
      <div className="row" style={{ gap: 8 }}>
        <button type="button" className="btn outline sm on-dark" onClick={onDiscard} disabled={saving}>{discardLabel}</button>
        <button type="button" className="btn primary sm" onClick={onSave} disabled={saving} aria-busy={saving || undefined}>{saving && <Spinner size={12} />}{saveLabel}</button>
      </div>
    </div>
  );
}
`;

T.badge = String.raw`import type { HTMLAttributes } from 'react';
import { cx } from '../cx';

export type BadgeTone = __V__;
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> { tone?: BadgeTone; size?: __S__; dot?: boolean }

/** Short status or count. Custom semantic tones use their own roles: --{tone}-subtle and --{tone}-text. */
export function Badge({ tone = '__VD__', size = '__SD__', dot, className, children, style, ...rest }: BadgeProps) {
  const known = [__VLIST__].includes(tone);
  return (
    <span className={cx('badge', known && tone, size === 'sm' && 'sm', className)}
      style={known ? style : { background: 'var(--' + tone + '-subtle)', color: 'var(--' + tone + '-text)', ...style }} {...rest}>
      {dot && <i />}{children}
    </span>
  );
}
`;

T.progress = String.raw`export interface ProgressBarProps {
  /** 0-100. Leave undefined for indeterminate (circular only). */
  value?: number;
  label: string;
  variant?: __V__;
  error?: boolean;
  showValue?: boolean;
}

export function ProgressBar({ value, label, variant = '__VD__', error, showValue = true }: ProgressBarProps) {
  const v = Math.max(0, Math.min(100, value ?? 0));
  if (variant === 'circular') {
    return (
      <svg className="ring" viewBox="0 0 44 44" role="progressbar" aria-label={label} aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--bg-active)" strokeWidth="5" />
        <circle cx="22" cy="22" r="18" fill="none" stroke={error ? 'var(--critical-solid)' : 'var(--primary-solid)'} strokeWidth="5" strokeLinecap="round"
          strokeDasharray="113" strokeDashoffset={113 - (113 * v) / 100} transform="rotate(-90 22 22)" />
      </svg>
    );
  }
  return (
    <div className="col" style={{ gap: 8, width: '100%' }}>
      <div className="row t-small" style={{ justifyContent: 'space-between' }}><span>{label}</span>{showValue && <span className="faint">{v} %</span>}</div>
      <div className={error ? 'progress err' : 'progress'} role="progressbar" aria-label={label} aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}><div style={{ width: v + '%' }} /></div>
    </div>
  );
}
`;

T.spinner = String.raw`import { Spinner as Svg } from '../Icon';

const SIZE: Record<string, number> = { sm: 14, md: 22, lg: 32 };

/** Use when the wait is short or its length unknown; for longer known waits use ProgressBar. */
export function Spinner({ size = '__SD__', label = 'Loading' }: { size?: __S__; label?: string }) {
  return <span role="status" style={{ display: 'inline-flex' }}><Svg size={SIZE[size] ?? 22} label={label} /></span>;
}
`;

T.skeleton = String.raw`import type { CSSProperties } from 'react';

export interface SkeletonProps { variant?: __V__; width?: number | string; height?: number | string; lines?: number; style?: CSSProperties }

/** Placeholder while content loads. Match the shape of what is coming. */
export function Skeleton({ variant = '__VD__', width, height, lines = 3, style }: SkeletonProps) {
  if (variant === 'avatar') return <div className="skel" aria-hidden="true" style={{ width: width ?? 40, height: height ?? 40, borderRadius: '50%', ...style }} />;
  if (variant === 'block') return <div className="skel" aria-hidden="true" style={{ width: width ?? '100%', height: height ?? 120, ...style }} />;
  return (
    <div className="col" aria-hidden="true" style={{ gap: 8, width: width ?? '100%', ...style }}>
      {Array.from({ length: lines }, (_, i) => <div key={i} className="skel" style={{ height: 12, width: i === lines - 1 ? '60%' : '100%' }} />)}
    </div>
  );
}
`;

T['empty-state'] = String.raw`import type { ReactNode } from 'react';

export interface EmptyStateProps { title: string; description?: ReactNode; icon?: ReactNode; action?: ReactNode }

/** Explain why it is empty and offer the next step. */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="empty">
      {icon && <div className="art" aria-hidden="true">{icon}</div>}
      <b>{title}</b>
      {description && <p className="t-small muted">{description}</p>}
      {action}
    </div>
  );
}
`;

T.dialog = String.raw`import { useEffect, useId, useRef, type ReactNode } from 'react';
import { cx } from '../cx';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** Buttons, right-aligned. Put the main action last. */
  actions?: ReactNode;
  size?: __S__;
  className?: string;
}

/** Modal dialog: traps attention, closes on Escape and on the backdrop, returns focus when it closes. */
export function Dialog({ open, onClose, title, children, actions, size = '__SD__', className }: DialogProps) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement as HTMLElement | null;
    box.current?.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); prev?.focus(); };
  }, [open, onClose]);
  if (!open) return null;
  const width = size === 'sm' ? 360 : size === 'lg' ? 640 : undefined;
  return (
    <div className="scrim fixed" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={box} className={cx('dialog', className)} role="dialog" aria-modal="true" aria-labelledby={id} style={width ? { width: 'min(100%, ' + width + 'px)' } : undefined}>
        <h3 className="t-h4" id={id}>{title}</h3>
        {children && <div className="t-small muted" style={{ marginTop: 8 }}>{children}</div>}
        {actions && <div className="actions">{actions}</div>}
      </div>
    </div>
  );
}
`;

T.drawer = String.raw`import { useEffect, useId, type ReactNode } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface DrawerProps { open: boolean; onClose: () => void; title: string; side?: __V__; children?: ReactNode; footer?: ReactNode }

/** Side or bottom sheet for secondary tasks (filters, details) without leaving the page. */
export function Drawer({ open, onClose, title, side = '__VD__', children, footer }: DrawerProps) {
  const id = useId();
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className={cx('scrim fixed sheet', side === 'bottom' && 'bottom')} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className={cx('drawer', side === 'bottom' && 'bottom')} role="dialog" aria-modal="true" aria-labelledby={id}>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <b id={id}>{title}</b>
          <button type="button" className="btn ghost icon sm" aria-label="Close" onClick={onClose}><Icon name="x" size={16} /></button>
        </div>
        {children}
        {footer && <div style={{ marginTop: 'auto' }} className="row">{footer}</div>}
      </aside>
    </div>
  );
}
`;

T['action-sheet'] = String.raw`import { useEffect } from 'react';
import { cx } from '../cx';

export interface ActionSheetAction { id: string; label: string; danger?: boolean }
export interface ActionSheetProps { open: boolean; title?: string; actions: ActionSheetAction[]; onSelect: (id: string) => void; onCancel: () => void; cancelLabel?: string }

/** Mobile list of actions from the bottom of the screen. Always offers Cancel. */
export function ActionSheet({ open, title, actions, onSelect, onCancel, cancelLabel = 'Cancel' }: ActionSheetProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);
  if (!open) return null;
  return (
    <div className="scrim fixed" style={{ alignItems: 'end', padding: 12 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="col" role="dialog" aria-modal="true" aria-label={title ?? 'Actions'} style={{ width: '100%', maxWidth: 420, gap: 8 }}>
        <div className="asheet">
          {title && <div className="asheet-title">{title}</div>}
          {actions.map((a) => <button key={a.id} type="button" className={cx(a.danger && 'danger')} onClick={() => onSelect(a.id)}>{a.label}</button>)}
        </div>
        <div className="asheet"><button type="button" style={{ fontWeight: 600 }} onClick={onCancel}>{cancelLabel}</button></div>
      </div>
    </div>
  );
}
`;

T.popover = String.raw`import { useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from 'react';

export interface PopoverProps {
  /** Text of the button that opens it. */
  trigger: ReactNode;
  children: ReactNode;
  label?: string;
  triggerClassName?: string;
}

/** Non-modal panel anchored to a button. Closes on Escape and on outside click. */
export function Popover({ trigger, children, label, triggerClassName = 'btn outline' }: PopoverProps): ReactElement {
  const id = useId();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return undefined;
    const out = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', out);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', out); document.removeEventListener('keydown', key); };
  }, [open]);
  return (
    <span ref={wrap} className="pop-wrap">
      <button type="button" className={triggerClassName} aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{trigger}</button>
      {open && <div id={id} className="popover" role="dialog" aria-label={label}>{children}</div>}
    </span>
  );
}
`;

T.tooltip = String.raw`import { cloneElement, useId, useState, type ReactElement } from 'react';

export interface TooltipProps {
  content: string;
  /** One focusable element (button, link). The tooltip describes it. */
  children: ReactElement;
}

/** Shows on hover and keyboard focus. Never put essential information only in a tooltip. */
export function Tooltip({ content, children }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const show = () => setOpen(true);
  const hide = () => setOpen(false);
  return (
    <span className="tip-wrap" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide} onKeyDown={(e) => e.key === 'Escape' && hide()}>
      {cloneElement(children, { 'aria-describedby': id })}
      <span id={id} role="tooltip" className="tooltip" hidden={!open}>{content}</span>
    </span>
  );
}
`;

T.card = String.raw`import type { HTMLAttributes } from 'react';
import { cx } from '../cx';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: __V__;
  /** Adds hover feedback. Make the whole card a link or button for it to be accessible. */
  interactive?: boolean;
}

export function Card({ variant = '__VD__', interactive, className, ...rest }: CardProps) {
  return <div className={cx('card', variant, interactive && 'interactive', className)} {...rest} />;
}
`;

T.table = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface Column<Row> { key: string; header: string; render?: (row: Row) => ReactNode; align?: 'left' | 'right' }
export interface DataTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  selectedKeys?: string[];
  onRowClick?: (row: Row) => void;
  variant?: __V__;
  caption?: string;
}

export function DataTable<Row extends Record<string, unknown>>({ columns, rows, rowKey, selectedKeys = [], onRowClick, variant = '__VD__', caption }: DataTableProps<Row>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={cx('tbl', variant === 'zebra' && 'zebra')}>
        {caption && <caption className="vh">{caption}</caption>}
        <thead><tr>{columns.map((c) => <th key={c.key} scope="col" style={{ textAlign: c.align }}>{c.header}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className={cx(selectedKeys.includes(rowKey(r)) && 'sel')} aria-selected={selectedKeys.length ? selectedKeys.includes(rowKey(r)) : undefined}
              onClick={onRowClick ? () => onRowClick(r) : undefined} style={onRowClick ? { cursor: 'pointer' } : undefined}>
              {columns.map((c) => <td key={c.key} style={{ textAlign: c.align }}>{c.render ? c.render(r) : String(r[c.key] ?? '')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;

T.list = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface ListItem { id: string; leading?: ReactNode; title: ReactNode; subtitle?: ReactNode; trailing?: ReactNode }

export function List({ items, label, className }: { items: ListItem[]; label?: string; className?: string }) {
  return (
    <div className={cx('list', className)} role="list" aria-label={label}>
      {items.map((it) => (
        <div key={it.id} role="listitem">
          {it.leading}
          <div style={{ flex: 1, minWidth: 0 }}><b className="t-small">{it.title}</b>{it.subtitle && <div className="help">{it.subtitle}</div>}</div>
          {it.trailing}
        </div>
      ))}
    </div>
  );
}
`;

T.avatar = String.raw`import { cx } from '../cx';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: __S__;
  online?: boolean;
  /** Colour slot for initials: 1 primary, 2 success, 3 warning, 4 info, 5 critical. */
  tone?: 1 | 2 | 3 | 4 | 5;
}

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export function Avatar({ name, src, size = '__SD__', online, tone = 1 }: AvatarProps) {
  return (
    <span className={cx('avatar', size !== 'md' && size, tone > 1 && 'c' + tone)} role="img" aria-label={name + (online ? ' (online)' : '')}
      style={src ? { backgroundImage: 'url(' + src + ')', backgroundSize: 'cover', color: 'transparent' } : undefined}>
      {!src && initials(name)}
      {online && <span className="on" />}
    </span>
  );
}

export function AvatarStack({ children }: { children: React.ReactNode }) {
  return <div className="stack">{children}</div>;
}
`;

T.stat = String.raw`import type { ReactNode } from 'react';

export interface StatProps {
  label: string;
  value: ReactNode;
  unit?: string;
  /** e.g. "+6%". Direction picks the colour. */
  delta?: string;
  direction?: 'up' | 'down';
  /** A chart or extra detail under the number. */
  children?: ReactNode;
}

export function Stat({ label, value, unit, delta, direction = 'up', children }: StatProps) {
  return (
    <div className="stat card">
      <div className="row stat-hd"><span className="t-small muted">{label}</span>{delta && <span className={'badge ' + (direction === 'down' ? 'critical' : 'success')}>{delta}</span>}</div>
      <div className="num" style={{ margin: '8px 0 12px' }}>{value}{unit && <span className="t-lead muted">{unit}</span>}</div>
      {children}
    </div>
  );
}
`;

T.accordion = String.raw`import { useId, useState, type ReactNode } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface AccordionItem { id: string; title: string; content: ReactNode }
export interface AccordionProps { items: AccordionItem[]; defaultOpen?: string[]; multiple?: boolean; className?: string }

export function Accordion({ items, defaultOpen = [], multiple = false, className }: AccordionProps) {
  const base = useId();
  const [open, setOpen] = useState<string[]>(defaultOpen);
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]));
  return (
    <div className={cx('acc', className)}>
      {items.map((it) => {
        const on = open.includes(it.id);
        return (
          <div key={it.id}>
            <h3 style={{ margin: 0, font: 'inherit' }}>
              <button type="button" className="hd" aria-expanded={on} aria-controls={base + it.id} onClick={() => toggle(it.id)}>
                {it.title}<Icon name={on ? 'minus' : 'plus'} size={14} />
              </button>
            </h3>
            <div className={cx('bd-wrap', on && 'open')} id={base + it.id} role="region" aria-hidden={!on}><div><div className="bd">{it.content}</div></div></div>
          </div>
        );
      })}
    </div>
  );
}
`;

T.timeline = String.raw`import type { ReactNode } from 'react';

export interface TimelineEvent { id: string; title: ReactNode; time: string; detail?: ReactNode }

export function Timeline({ events, label = 'Activity' }: { events: TimelineEvent[]; label?: string }) {
  return (
    <ol className="tl" aria-label={label} style={{ listStyle: 'none', margin: 0 }}>
      {events.map((e) => <li key={e.id}><b>{e.title}</b> {e.detail}<div className="help">{e.time}</div></li>)}
    </ol>
  );
}
`;

T.code = String.raw`import { useState } from 'react';

export interface CodeBlockProps { code: string; variant?: __V__; copyLabel?: string }

/** Block code with a copy button, or inline code inside text. */
export function CodeBlock({ code, variant = '__VD__', copyLabel = 'Copy' }: CodeBlockProps) {
  const [done, setDone] = useState(false);
  if (variant === 'inline') return <code className="inl">{code}</code>;
  return (
    <div style={{ position: 'relative' }}>
      <pre className="code"><code>{code}</code></pre>
      <button type="button" className="btn ghost sm" style={{ position: 'absolute', top: 8, right: 8, color: 'var(--color-neutral-2)' }}
        onClick={() => navigator.clipboard?.writeText(code).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })}>
        {done ? '✓' : copyLabel}
      </button>
    </div>
  );
}
`;

T.divider = String.raw`export function Divider({ orientation = '__VD__' }: { orientation?: __V__ }) {
  return orientation === 'vertical'
    ? <span className="vdiv" role="separator" aria-orientation="vertical" />
    : <hr className="div" />;
}
`;

T.kbd = String.raw`/** Keyboard key. Pass several keys to show a shortcut: <Kbd keys={['⌘', 'K']} /> */
export function Kbd({ keys }: { keys: string[] }) {
  return <span className="row" style={{ gap: 4, display: 'inline-flex' }}>{keys.map((k) => <kbd key={k}>{k}</kbd>)}</span>;
}
`;


T['inline-edit'] = String.raw`import { useEffect, useRef, useState } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface InlineEditProps {
  label: string;
  value: string;
  /** Return an error message to keep the field open, or nothing to accept. */
  onSave: (value: string) => string | void;
  /** text: free text. select: pick from options. */
  variant?: __V__;
  options?: string[];
  placeholder?: string;
  className?: string;
}

/** Shows the value as text; click (or Enter) to edit, Enter or ✓ to save, Escape or ✕ to cancel. */
export function InlineEdit({ label, value, onSave, variant = '__VD__', options = [], placeholder = 'Add a value', className }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [error, setError] = useState('');
  const field = useRef<HTMLInputElement & HTMLSelectElement>(null);
  useEffect(() => { if (editing) field.current?.focus(); }, [editing]);
  const save = () => { const e = onSave(draft); if (e) { setError(e); return; } setError(''); setEditing(false); };
  const cancel = () => { setDraft(value); setError(''); setEditing(false); };
  if (!editing) {
    return (
      <div className={cx('inline-edit', className)}>
        <button type="button" className="ie-view" aria-label={label + ': ' + (value || placeholder) + '. Edit'} onClick={() => { setDraft(value); setEditing(true); }}>
          {value ? value : <span className="ie-empty">{placeholder}</span>}<Icon name="edit" size={14} />
        </button>
      </div>
    );
  }
  const keys = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); save(); } if (e.key === 'Escape') cancel(); };
  return (
    <div className={cx('col', className)} style={{ gap: 4 }}>
      <div className="ie-edit">
        {variant === 'select'
          ? <div className="input select"><select ref={field} aria-label={label} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={keys}>{options.map((o) => <option key={o}>{o}</option>)}</select><Icon name="chevronDown" size={16} /></div>
          : <input ref={field} className={cx('input', error && 'error')} aria-label={label} aria-invalid={error ? true : undefined} value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={keys} />}
        <button type="button" className="btn outline icon sm" aria-label="Save" onClick={save}><Icon name="check" size={14} /></button>
        <button type="button" className="btn ghost icon sm" aria-label="Cancel" onClick={cancel}><Icon name="x" size={14} /></button>
      </div>
      {error && <span className="help err" role="alert">{error}</span>}
    </div>
  );
}
`;

T['time-picker'] = String.raw`import { useId, useMemo, useState } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface TimePickerProps {
  label: string;
  /** "HH:MM", 24-hour. */
  value: string | null;
  onChange: (value: string) => void;
  /** list: pick from slots. input: native time field (best on mobile). */
  variant?: __V__;
  /** Minutes between slots in the list. */
  step?: number;
  min?: string;
  max?: string;
  className?: string;
}

const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toTime = (n: number) => String(Math.floor(n / 60)).padStart(2, '0') + ':' + String(n % 60).padStart(2, '0');

export function TimePicker({ label, value, onChange, variant = '__VD__', step = 30, min = '00:00', max = '23:59', className }: TimePickerProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const slots = useMemo(() => { const out: string[] = []; for (let n = toMin(min); n <= toMin(max); n += step) out.push(toTime(n)); return out; }, [min, max, step]);
  if (variant === 'input') {
    return (
      <div className={cx('field tp', className)}>
        <label className="label" htmlFor={id}>{label}</label>
        <div className="input"><Icon name="clock" size={16} /><input id={id} type="time" value={value ?? ''} min={min} max={max} step={step * 60} onChange={(e) => onChange(e.target.value)} /></div>
      </div>
    );
  }
  return (
    <div className={cx('field tp combo', className)}>
      <label className="label" id={id + '-l'}>{label}</label>
      <button type="button" className={cx('input select', open && 'focus')} aria-haspopup="listbox" aria-expanded={open} aria-labelledby={id + '-l'}
        onClick={() => setOpen(!open)} onKeyDown={(e) => e.key === 'Escape' && setOpen(false)} style={{ width: '100%' }}>
        <span>{value ?? '--:--'}</span><Icon name="chevronDown" size={16} />
      </button>
      {open && (
        <div className="menu" role="listbox" aria-labelledby={id + '-l'}>
          {slots.map((t) => (
            <div key={t} role="option" tabIndex={0} aria-selected={t === value} className={cx(t === value && 'hover')}
              onClick={() => { onChange(t); setOpen(false); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(t); setOpen(false); } }}>{t}</div>
          ))}
        </div>
      )}
    </div>
  );
}
`;

T['color-picker'] = String.raw`import { useRef, useState, type PointerEvent } from 'react';
import { cx } from '../cx';

export interface ColorPickerProps {
  /** Hex colour, e.g. "#7c5cff". */
  value: string;
  onChange: (hex: string) => void;
  /** swatches: palette only. full: saturation area, hue and palette. */
  variant?: __V__;
  swatches?: string[];
  label?: string;
  className?: string;
}

const DEFAULT_SWATCHES = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];

function hexToHsv(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
  const max = Math.max(r, g, b), d = max - Math.min(r, g, b);
  const h = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, max === 0 ? 0 : d / max, max];
}
function hsvToHex(h: number, s: number, v: number) {
  const f = (k: number) => { const x = (k + h / 60) % 6; return v - v * s * Math.max(0, Math.min(x, 4 - x, 1)); };
  return '#' + [f(5), f(3), f(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, '0')).join('');
}
const valid = (t: string) => /^#[0-9a-f]{6}$/i.test(t);

export function ColorPicker({ value, onChange, variant = '__VD__', swatches = DEFAULT_SWATCHES, label = 'Colour', className }: ColorPickerProps) {
  const [h, s, v] = hexToHsv(valid(value) ? value : '#000000');
  const [hue, setHue] = useState(h);
  const [text, setText] = useState(value);
  const area = useRef<HTMLDivElement>(null);
  const set = (hex: string) => { setText(hex); onChange(hex); };
  const drag = (e: PointerEvent) => {
    const r = area.current!.getBoundingClientRect();
    const sat = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const val = 1 - Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    set(hsvToHex(hue, sat, val));
  };
  return (
    <div className={cx('cpick', className)} role="group" aria-label={label}>
      {variant === 'full' && (
        <>
          <div ref={area} className="cp-area" style={{ ['--cp-hue' as string]: hsvToHex(hue, 1, 1) }} aria-hidden="true"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); drag(e); }} onPointerMove={(e) => e.buttons && drag(e)}>
            <span className="cp-knob" style={{ left: s * 100 + '%', top: (1 - v) * 100 + '%', background: value }} />
          </div>
          <div className="cp-hue">
            <input type="range" min={0} max={359} value={Math.round(hue)} aria-label="Hue" onChange={(e) => { const n = Number(e.target.value); setHue(n); set(hsvToHex(n, s || 1, v || 1)); }} />
            <span className="cp-knob" style={{ left: (hue / 360) * 100 + '%', background: hsvToHex(hue, 1, 1) }} />
          </div>
        </>
      )}
      <div className="cp-swatches">
        {swatches.map((c) => <button key={c} type="button" aria-label={c} aria-pressed={c.toLowerCase() === value.toLowerCase()} className={cx(c.toLowerCase() === value.toLowerCase() && 'on')} style={{ background: c }} onClick={() => { setHue(hexToHsv(c)[0]); set(c); }} />)}
      </div>
      <div className="cp-row">
        <span className="cp-prev" style={{ background: value }} aria-hidden="true" />
        <input className="input" value={text} aria-label={label + ' (hex)'} spellCheck={false}
          onChange={(e) => { setText(e.target.value); const t = e.target.value.trim(); const hex = t.startsWith('#') ? t : '#' + t; if (valid(hex)) { setHue(hexToHsv(hex)[0]); onChange(hex.toLowerCase()); } }} />
      </div>
    </div>
  );
}
`;

T['context-menu'] = String.raw`import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../cx';

export type ContextMenuEntry = { id: string; label: string; icon?: ReactNode; shortcut?: string; danger?: boolean; disabled?: boolean } | 'separator';
export interface ContextMenuProps {
  items: ContextMenuEntry[];
  onSelect: (id: string) => void;
  /** The area that opens the menu on right click, long press, or Shift+F10 when focused. */
  children: ReactNode;
  label?: string;
  className?: string;
}

export function ContextMenu({ items, onSelect, children, label = 'Actions', className }: ContextMenuProps) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  const menu = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!at) return undefined;
    menu.current?.querySelector<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')?.focus();
    const close = (e: MouseEvent) => { if (!menu.current?.contains(e.target as Node)) setAt(null); };
    const esc = (e: globalThis.KeyboardEvent) => { if (e.key === 'Escape') { setAt(null); area.current?.focus(); } };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, [at]);
  const openAtElement = () => { const r = area.current!.getBoundingClientRect(); setAt({ x: r.left + 16, y: r.top + 16 }); };
  const move = (e: KeyboardEvent) => {
    const els = Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? []);
    const i = els.indexOf(document.activeElement as HTMLElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); els[(i + 1) % els.length]?.focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); els[(i - 1 + els.length) % els.length]?.focus(); }
  };
  const pick = (id: string) => { setAt(null); onSelect(id); area.current?.focus(); };
  return (
    <div ref={area} className={className} tabIndex={0} aria-haspopup="menu" aria-label={label + ' (Shift+F10)'}
      onContextMenu={(e) => { e.preventDefault(); setAt({ x: e.clientX, y: e.clientY }); }}
      onKeyDown={(e) => { if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') { e.preventDefault(); openAtElement(); } }}>
      {children}
      {at && (
        <div ref={menu} className="menu ctx-menu" role="menu" aria-label={label} style={{ left: Math.min(at.x, window.innerWidth - 220), top: Math.min(at.y, window.innerHeight - 40 * items.length) }} onKeyDown={move}>
          {items.map((it, i) => it === 'separator' ? <hr key={'s' + i} /> : (
            <div key={it.id} role="menuitem" tabIndex={-1} aria-disabled={it.disabled || undefined} className={cx(it.danger && 'danger')}
              onClick={() => !it.disabled && pick(it.id)} onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !it.disabled) { e.preventDefault(); pick(it.id); } }}>
              {it.icon}{it.label}{it.shortcut && <kbd>{it.shortcut}</kbd>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;

T['page-banner'] = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';
import { Icon, type IconName } from '../Icon';

export type PageBannerTone = __V__;
const ICON: Record<string, IconName> = { info: 'info', promo: 'star', warning: 'alert', critical: 'alert' };

export interface PageBannerProps {
  tone?: PageBannerTone;
  title?: ReactNode;
  children: ReactNode;
  action?: { label: string; href?: string; onClick?: () => void };
  onDismiss?: () => void;
  className?: string;
}

/** Full-width message above the page. One at a time; critical ones are announced at once. */
export function PageBanner({ tone = '__VD__', title, children, action, onDismiss, className }: PageBannerProps) {
  return (
    <div className={cx('pbanner', tone, className)} role={tone === 'critical' ? 'alert' : 'region'} aria-label={tone === 'critical' ? undefined : 'Announcement'}>
      <Icon name={ICON[tone] ?? 'info'} size={16} />
      <span className="pb-txt">{title && <b>{title}</b>}{children}</span>
      {action && (action.href ? <a className="pb-action" href={action.href}>{action.label}</a> : <button type="button" className="pb-action" onClick={action.onClick} style={{ all: 'unset', fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}>{action.label}</button>)}
      {onDismiss && <button type="button" className="pb-close" aria-label="Dismiss" onClick={onDismiss}><Icon name="x" size={14} /></button>}
    </div>
  );
}
`;

T.hero = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface HeroProps {
  /** centered: copy only. split: copy beside media. image: copy over a full-bleed image. */
  variant?: __V__;
  size?: __S__;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Buttons. Put the primary action first. */
  actions?: ReactNode;
  /** split: image URL or any node. image: background image URL. A brand-coloured placeholder is used when empty. */
  media?: string | ReactNode;
  mediaAlt?: string;
  className?: string;
}

/** The opening section of a page. Exactly one h1 per page: this is it. */
export function Hero({ variant = '__VD__', size = '__SD__', eyebrow, title, description, actions, media, mediaAlt = '', className }: HeroProps) {
  const copy = (
    <div className="hero-copy">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1>{title}</h1>
      {description && <p className="lead">{description}</p>}
      {actions && <div className="hero-actions">{actions}</div>}
    </div>
  );
  const art = (cls: string, strong = false) => typeof media === 'string'
    ? <div className={cx(cls, 'art-ph', strong && 'strong')}><img src={media} alt={mediaAlt} /></div>
    : media ? <div className={cls}>{media}</div> : <div className={cx(cls, 'art-ph', strong && 'strong')} aria-hidden="true" />;
  return (
    <section className={cx('hero', variant, size === 'lg' && 'lg', className)}>
      {variant === 'image' && art('hero-bg', true)}
      {copy}
      {variant === 'split' && art('hero-media')}
    </section>
  );
}
`;

T['media-card'] = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface MediaCardProps {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  /** Image URL or any node (video, illustration). A brand-coloured placeholder is used when empty. */
  media?: string | ReactNode;
  mediaAlt?: string;
  actions?: ReactNode;
  /** Makes the whole card a link. Keep actions empty in that case. */
  href?: string;
  variant?: __V__;
  className?: string;
}

export function MediaCard({ title, description, eyebrow, media, mediaAlt = '', actions, href, variant = '__VD__', className }: MediaCardProps) {
  const pic = typeof media === 'string'
    ? <div className="mcard-media art-ph"><img src={media} alt={mediaAlt} /></div>
    : media ? <div className="mcard-media">{media}</div> : <div className="mcard-media art-ph" aria-hidden="true" />;
  const body = (
    <div className="mcard-main">
      <div className="mcard-body">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h3>{href ? <a href={href} style={{ color: 'inherit', textDecoration: 'none' }}>{title}</a> : title}</h3>
        {description && <p className="t-small muted">{description}</p>}
      </div>
      {actions && <div className="mcard-actions">{actions}</div>}
    </div>
  );
  return <article className={cx('mcard', variant === 'horizontal' && 'horizontal', href && 'interactive', className)}>{pic}{body}</article>;
}
`;

T['product-card'] = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface ProductCardProps {
  name: string;
  /** Formatted price, e.g. "79,00 €". */
  price: string;
  /** Previous price when on sale. */
  compareAt?: string;
  image?: string;
  rating?: number;
  reviews?: number;
  badge?: ReactNode;
  soldOut?: boolean;
  favorite?: boolean;
  onFavorite?: (favorite: boolean) => void;
  onAdd?: () => void;
  addLabel?: string;
  href?: string;
  variant?: __V__;
  className?: string;
}

export function ProductCard({ name, price, compareAt, image, rating, reviews, badge, soldOut, favorite = false, onFavorite, onAdd, addLabel = 'Add to cart', href, variant = '__VD__', className }: ProductCardProps) {
  return (
    <article className={cx('pcard', variant === 'compact' && 'compact', soldOut && 'sold-out', className)}>
      <div className="pcard-media art-ph">
        {image && <img src={image} alt="" />}
        {badge}
        {onFavorite && <button type="button" className="btn ghost icon pcard-fav" aria-pressed={favorite} aria-label={(favorite ? 'Remove ' : 'Save ') + name} onClick={() => onFavorite(!favorite)}><Icon name="star" size={16} /></button>}
      </div>
      <div className="pcard-body">
        {href ? <a className="pcard-name" href={href} style={{ color: 'inherit', textDecoration: 'none' }}>{name}</a> : <span className="pcard-name">{name}</span>}
        {rating != null && (
          <div className="row" style={{ gap: 4 }} role="img" aria-label={'Rated ' + rating + ' of 5'}>
            {[1, 2, 3, 4, 5].map((k) => <Icon key={k} name="star" size={12} style={{ color: k <= Math.round(rating) ? 'var(--warning-solid)' : 'var(--border-strong)', fill: k <= Math.round(rating) ? 'currentColor' : 'none' }} />)}
            {reviews != null && <span className="help">({reviews})</span>}
          </div>
        )}
        <div className="price">{compareAt ? <><b className="sale">{price}</b><s aria-label={'Was ' + compareAt}>{compareAt}</s></> : <b>{price}</b>}</div>
        {variant !== 'compact' && onAdd && <button type="button" className="btn primary sm block" disabled={soldOut} onClick={onAdd}>{soldOut ? 'Sold out' : addLabel}</button>}
      </div>
    </article>
  );
}
`;

T['pricing-card'] = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface PricingFeature { label: string; included?: boolean }
export interface PricingCardProps {
  name: string;
  description?: string;
  /** Formatted amount, e.g. "24 €". */
  price: string;
  period?: string;
  features: PricingFeature[];
  /** The call to action, usually a Button with block. */
  action: ReactNode;
  /** Highlights the recommended plan. Use on one card at most. */
  featured?: boolean;
  tag?: string;
  className?: string;
}

export function PricingCard({ name, description, price, period = '/ month', features, action, featured = false, tag = 'Most popular', className }: PricingCardProps) {
  return (
    <article className={cx('prcard', featured && 'featured', className)} aria-label={name + ' plan'}>
      {featured && <span className="badge primary prcard-tag">{tag}</span>}
      <div className="col" style={{ gap: 4 }}><h3 className="prcard-name">{name}</h3>{description && <span className="help">{description}</span>}</div>
      <div className="prcard-price"><span className="amount">{price}</span><span className="per">{period}</span></div>
      <ul>
        {features.map((f) => (
          <li key={f.label} className={cx(f.included === false && 'no')}>
            <Icon name={f.included === false ? 'minus' : 'check'} size={14} strokeWidth={2.4} />
            {f.label}{f.included === false && <span className="vh"> (not included)</span>}
          </li>
        ))}
      </ul>
      {action}
    </article>
  );
}
`;

T['profile-card'] = String.raw`import type { ReactNode } from 'react';
import { cx } from '../cx';

export interface ProfileCardProps {
  name: string;
  role?: string;
  avatar?: string;
  online?: boolean;
  stats?: Array<{ label: string; value: ReactNode }>;
  actions?: ReactNode;
  /** cover: adds a banner image behind the avatar. */
  variant?: __V__;
  cover?: string;
  className?: string;
}

const initials = (n: string) => n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export function ProfileCard({ name, role, avatar, online, stats = [], actions, variant = '__VD__', cover, className }: ProfileCardProps) {
  return (
    <article className={cx('prof', variant === 'cover' && 'cover', className)}>
      {variant === 'cover' && <div className="prof-cover art-ph strong" aria-hidden="true">{cover && <img src={cover} alt="" />}</div>}
      <div className="prof-body">
        <span className="avatar xl" role="img" aria-label={name} style={avatar ? { backgroundImage: 'url(' + avatar + ')', backgroundSize: 'cover', color: 'transparent' } : undefined}>
          {!avatar && initials(name)}{online && <span className="on" />}
        </span>
        <b>{name}</b>
        {role && <span className="help">{role}</span>}
        {stats.length > 0 && <dl className="prof-stats" style={{ margin: 0 }}>{stats.map((s) => <div key={s.label}><dd style={{ margin: 0 }}><b>{s.value}</b></dd><dt>{s.label}</dt></div>)}</dl>}
        {actions && <div className="prof-actions">{actions}</div>}
      </div>
    </article>
  );
}
`;

T.carousel = String.raw`import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
import { cx } from '../cx';
import { Icon } from '../Icon';

export interface CarouselProps {
  label: string;
  children: ReactNode;
  /** slides: one at a time. peek: shows the edge of the next slide. */
  variant?: __V__;
  className?: string;
}

/** Scroll-snap carousel: swipe, arrows, dots and keyboard. No autoplay: people read at their own pace. */
export function Carousel({ label, children, variant = '__VD__', className }: CarouselProps) {
  const slides = Children.toArray(children);
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    const onScroll = () => {
      const kids = Array.from(el.children) as HTMLElement[];
      const i = kids.reduce((best, k, n) => (Math.abs(k.offsetLeft - el.offsetLeft - el.scrollLeft) < Math.abs(kids[best].offsetLeft - el.offsetLeft - el.scrollLeft) ? n : best), 0);
      setIndex(i);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  const go = (i: number) => {
    const el = track.current;
    const n = (i + slides.length) % slides.length;
    const kid = el?.children[n] as HTMLElement | undefined;
    if (el && kid) el.scrollTo({ left: kid.offsetLeft - el.offsetLeft });
    setIndex(n);
  };
  return (
    <section className={cx('carousel', variant === 'peek' && 'peek', className)} aria-roledescription="carousel" aria-label={label}
      onKeyDown={(e) => { if (e.key === 'ArrowRight') go(index + 1); if (e.key === 'ArrowLeft') go(index - 1); }}>
      <div className="carousel-track" ref={track} aria-live="polite">
        {slides.map((s, i) => <div key={i} role="group" aria-roledescription="slide" aria-label={i + 1 + ' of ' + slides.length}>{s}</div>)}
      </div>
      <div className="carousel-foot">
        <div className="pagectl" role="tablist" aria-label="Slides">
          {slides.map((_, i) => <button key={i} type="button" role="tab" aria-selected={i === index} aria-label={'Slide ' + (i + 1)} className={cx(i === index && 'on')} onClick={() => go(i)} />)}
        </div>
        <div className="row" style={{ gap: 4 }}>
          <button type="button" className="btn outline icon sm" aria-label="Previous slide" onClick={() => go(index - 1)}><Icon name="chevronLeft" size={14} /></button>
          <button type="button" className="btn outline icon sm" aria-label="Next slide" onClick={() => go(index + 1)}><Icon name="chevronRight" size={14} /></button>
        </div>
      </div>
    </section>
  );
}

/** A slide with a brand-coloured background (or an image) and an optional caption. */
export function CarouselSlide({ title, caption, image, strong }: { title?: string; caption?: string; image?: string; strong?: boolean }) {
  return (
    <div className={cx('slide art-ph', strong && 'strong')}>
      {image && <img src={image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
      {(title || caption) && <div className="slide-cap">{title && <b>{title}</b>}{caption && <span className="muted">{caption}</span>}</div>}
    </div>
  );
}
`;

// ---------------------------------------------------------------------------

function fill(tpl, meta) {
  const v = meta.variants ?? [];
  const s = meta.sizes ?? [];
  return tpl
    .replaceAll('__VLIST__', v.map((x) => `'${x}'`).join(', '))
    .replaceAll('__VD__', v[0] ?? 'default')
    .replaceAll('__V__', union(v))
    .replaceAll('__SD__', s.includes('md') ? 'md' : (s[0] ?? 'md'))
    .replaceAll('__S__', union(s));
}

/** Ids that have a React template. */
export const REACT_READY = Object.keys(T);

/** One TSX file for a catalogue component, or null if it has no template. */
export function reactComponent(id) {
  const meta = COMPONENTS.find((c) => c.id === id);
  if (!meta || !T[id]) return null;
  return { name: reactName(id), file: `components/${reactName(id)}.tsx`, text: fill(T[id], meta) };
}

function readme(sys, comps) {
  const name = sys.brand.name;
  const first = comps[0]?.name ?? 'Button';
  return `# ${name} — React components

Generated by Tokenforge from the ${name} design system. ${comps.length} components, typed with TypeScript,
painted only with the system tokens: change a token and every component follows.

## Install

1. Copy this folder into your app, e.g. \`src/design-system/\`.
2. Import the styles once, at the root of your app:

\`\`\`ts
import './design-system/tokens.css';
import './design-system/components.css';
\`\`\`

3. Wrap the app in the provider. It scopes the styles and sets the theme and the sub-brand:

\`\`\`tsx
import { DesignSystemProvider, ${first} } from './design-system';

export default function App() {
  return (
    <DesignSystemProvider theme="light">
      <${first} />
    </DesignSystemProvider>
  );
}
\`\`\`

Leave \`theme\` undefined to follow the user's system setting. Pass \`brand="slug"\` to show a sub-brand.

## Rules
- React 18+. No runtime dependencies besides React.
- Components are controlled where they hold a value (\`value\` + \`onChange\`).
- Accessibility is built in: labels, roles, keyboard support, focus rings. Keep the \`label\` props: they are the accessible names.
- Overlays (Dialog, Drawer, ActionSheet) render in place with \`position: fixed\`. Keep them inside the provider so they get the styles.
- Icons are a tiny built-in set (\`Icon.tsx\`). Pass your own icons through the \`icon\`/\`iconStart\` props.
- Motion: \`components.css\` uses \`--duration-*\` and \`--ease-standard\`; springs are in \`motion.js\` from the main export.

## Components
${comps.map((c) => `- \`${c.name}\` — ${c.desc}`).join('\n')}
`;
}

/**
 * The React package as a list of files.
 * componentsCss is the tool's component stylesheet (ds.css) and tokensCss the tokens export.
 */
export function toReactPackage(sys, { componentsCss = '', tokensCss = '' } = {}) {
  const ids = (sys.brand.components ?? []).filter((id) => T[id]);
  const comps = ids.map((id) => {
    const meta = COMPONENTS.find((c) => c.id === id);
    return { ...reactComponent(id), desc: meta.descEn ?? meta.desc };
  });
  const exportsOf = (c) => {
    const names = [...c.text.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);
    const types = [...c.text.matchAll(/^export (?:type|interface) (\w+)/gm)].map((m) => m[1]);
    return [`export { ${names.join(', ')} } from './components/${c.name}';`, types.length ? `export type { ${types.join(', ')} } from './components/${c.name}';` : ''].filter(Boolean).join('\n');
  };
  const index = [
    `// ${sys.brand.name} design system — React components. Generated by Tokenforge.`,
    `export { DesignSystemProvider } from './DesignSystemProvider';`,
    `export type { DesignSystemProviderProps } from './DesignSystemProvider';`,
    `export { Icon, Spinner as SpinnerIcon } from './Icon';`,
    `export { cx } from './cx';`,
    ...comps.map(exportsOf),
    '',
  ].join('\n');
  const css = `/* ${sys.brand.name} — component styles. Generated by Tokenforge. Load after tokens.css. */\n${componentsCss}\n${GLUE_CSS}`;
  return [
    { file: 'README.md', text: readme(sys, comps) },
    { file: 'index.ts', text: index },
    { file: 'DesignSystemProvider.tsx', text: PROVIDER },
    { file: 'Icon.tsx', text: ICON },
    { file: 'cx.ts', text: CX },
    { file: 'tokens.css', text: tokensCss },
    { file: 'components.css', text: css },
    ...comps.map((c) => ({ file: c.file, text: c.text })),
    { file: 'examples/Showcase.tsx', text: `// Every component of ${sys.brand.name} in use. Render <Showcase /> anywhere to review the system.\n` + reactShowcase(ids, '..') },
  ];
}

// ---------------------------------------------------------------------------
// Usage examples: one per component. Used in the README, the docs and the render test.
// Each is a function named Example; imports come from the package index.

export const EXAMPLES = {
  button: `function Example() {
  return (
    <div className="row">
      <Button>Save</Button>
      <Button variant="secondary">Preview</Button>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive" iconStart={<Icon name="x" size={14} />}>Delete</Button>
      <Button loading>Saving</Button>
    </div>
  );
}`,
  'icon-button': `function Example() {
  return <IconButton label="Search" icon={<Icon name="search" />} variant="outline" />;
}`,
  'button-group': `function Example() {
  const [value, setValue] = useState(['bold']);
  return <ButtonGroup label="Text style" multiple value={value} onChange={setValue}
    options={[{ value: 'bold', label: 'Bold' }, { value: 'italic', label: 'Italic' }, { value: 'underline', label: 'Underline' }]} />;
}`,
  link: `function Example() {
  return <p>Read the <Link href="#guidelines">token guidelines</Link> before publishing.</p>;
}`,
  fab: `function Example() {
  return <Fab label="Create" variant="extended" />;
}`,
  toolbar: `function Example() {
  return (
    <Toolbar label="Formatting">
      <IconButton label="Copy" icon={<Icon name="file" />} variant="ghost" size="sm" />
      <ToolbarDivider />
      <Button size="sm">Publish</Button>
    </Toolbar>
  );
}`,
  'text-field': `function Example() {
  const [email, setEmail] = useState('');
  const invalid = email.length > 0 && !email.includes('@');
  return <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
    placeholder="maya@company.com" hint="We never share it." error={invalid ? 'Enter a valid email.' : undefined} />;
}`,
  textarea: `function Example() {
  return <Textarea label="Description" placeholder="What is this token for?" />;
}`,
  select: `function Example() {
  const [country, setCountry] = useState('es');
  return <Select label="Country" value={country} onChange={(e) => setCountry(e.target.value)}
    options={[{ value: 'es', label: 'Spain' }, { value: 'pt', label: 'Portugal' }, { value: 'fr', label: 'France' }]} />;
}`,
  combobox: `function Example() {
  const [value, setValue] = useState<string | null>(null);
  return <Combobox label="Framework" options={['React', 'Remix', 'Preact', 'Svelte', 'Vue']} value={value} onChange={setValue} placeholder="Type to search" />;
}`,
  search: `function Example() {
  return <SearchField placeholder="Search tokens…" shortcut="⌘K" />;
}`,
  'number-input': `function Example() {
  const [qty, setQty] = useState(16);
  return <NumberInput label="Quantity" value={qty} onChange={setQty} min={0} max={99} />;
}`,
  'tag-input': `function Example() {
  const [people, setPeople] = useState(['Maya Díaz', 'design@acme.com']);
  return <TagInput label="Invite" value={people} onChange={setPeople} placeholder="Add people…" />;
}`,
  otp: `function Example() {
  const [code, setCode] = useState('824');
  return <OtpInput value={code} onChange={setCode} />;
}`,
  'date-picker': `function Example() {
  const [date, setDate] = useState<Date>(new Date(2026, 10, 12));
  return <DatePicker value={date} onChange={(d) => setDate(d as Date)} locale="en-GB" />;
}`,
  'file-upload': `function Example() {
  const [names, setNames] = useState<string[]>([]);
  return (
    <div className="col">
      <FileUpload hint="PDF, PNG up to 10 MB" onFiles={(f) => setNames(f.map((x) => x.name))} />
      {names.length > 0 && <span className="help">{names.join(', ')}</span>}
    </div>
  );
}`,
  slider: `function Example() {
  const [range, setRange] = useState<number | [number, number]>([25, 70]);
  return <Slider label="Price" value={range} onChange={setRange} />;
}`,
  checkbox: `function Example() {
  const [on, setOn] = useState(true);
  return <Checkbox label="Comments on my files" checked={on} onChange={setOn} />;
}`,
  radio: `function Example() {
  const [plan, setPlan] = useState('basic');
  return <RadioGroup label="Plan" variant="card" value={plan} onChange={setPlan}
    options={[{ value: 'basic', label: 'Basic', description: 'For individuals' }, { value: 'team', label: 'Team', description: 'Up to 20 seats' }]} />;
}`,
  switch: `function Example() {
  const [on, setOn] = useState(true);
  return <Switch label="Notifications" checked={on} onChange={setOn} />;
}`,
  segmented: `function Example() {
  const [view, setView] = useState('week');
  return <SegmentedControl label="Range" value={view} onChange={setView}
    options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} />;
}`,
  chip: `function Example() {
  const [on, setOn] = useState(true);
  return (
    <div className="row">
      <Chip selected={on} onToggle={setOn}>Design</Chip>
      <Chip variant="input" onRemove={() => {}}>React</Chip>
      <Chip variant="static">v2.1</Chip>
    </div>
  );
}`,
  rating: `function Example() {
  const [stars, setStars] = useState(4);
  return <Rating value={stars} onChange={setStars} label="Your rating" />;
}`,
  tabs: `function Example() {
  const [tab, setTab] = useState('overview');
  return <Tabs label="Sections" value={tab} onChange={setTab} items={[
    { value: 'overview', label: 'Overview', content: <p>Overview content</p> },
    { value: 'tokens', label: 'Tokens', content: <p>Tokens content</p> },
    { value: 'settings', label: 'Settings', content: <p>Settings content</p> },
  ]} />;
}`,
  breadcrumb: `function Example() {
  return <Breadcrumb items={[{ label: 'Workspace', href: '#' }, { label: 'Tokens', href: '#' }, { label: 'Color' }]} />;
}`,
  pagination: `function Example() {
  const [page, setPage] = useState(2);
  return <Pagination page={page} pageCount={8} onChange={setPage} />;
}`,
  'page-control': `function Example() {
  const [i, setI] = useState(1);
  return <PageControl count={5} index={i} onChange={setI} />;
}`,
  sidebar: `function Example() {
  const [active, setActive] = useState('tokens');
  return <SideNav title="Workspace" activeId={active} onNavigate={setActive} items={[
    { id: 'overview', label: 'Overview' }, { id: 'tokens', label: 'Tokens', count: 128 }, { id: 'components', label: 'Components', count: 46 },
  ]} />;
}`,
  'nav-rail': `function Example() {
  const [active, setActive] = useState('home');
  return <NavRail activeId={active} onNavigate={setActive} items={[
    { id: 'home', label: 'Home', icon: <Icon name="star" size={20} /> },
    { id: 'files', label: 'Files', icon: <Icon name="file" size={20} /> },
    { id: 'search', label: 'Search', icon: <Icon name="search" size={20} /> },
  ]} />;
}`,
  'nav-bar': `function Example() {
  const [active, setActive] = useState('home');
  return <BottomNav activeId={active} onNavigate={setActive} items={[
    { id: 'home', label: 'Home', icon: <Icon name="star" size={20} /> },
    { id: 'search', label: 'Search', icon: <Icon name="search" size={20} /> },
    { id: 'alerts', label: 'Alerts', icon: <Icon name="info" size={20} />, badge: 3 },
  ]} />;
}`,
  topbar: `function Example() {
  return <TopBar title="Acme" actions={<IconButton label="Search" icon={<Icon name="search" />} variant="ghost" size="sm" />}>
    <SearchField placeholder="Search" />
  </TopBar>;
}`,
  stepper: `function Example() {
  return <Stepper steps={['Account', 'Brand', 'Publish']} current={1} />;
}`,
  menu: `function Example() {
  const [last, setLast] = useState('');
  return (
    <div className="col">
      <Menu onSelect={setLast} items={[
        { id: 'rename', label: 'Rename', shortcut: 'R' },
        { id: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
        'separator',
        { id: 'delete', label: 'Delete', danger: true },
      ]} />
      {last && <span className="help">Selected: {last}</span>}
    </div>
  );
}`,
  alert: `function Example() {
  return <Alert tone="warning" title="Low contrast">Two pairs fail APCA in dark mode.</Alert>;
}`,
  toast: `function Example() {
  return <Toast tone="success" title="Changes saved" description="Your tokens are up to date." onClose={() => {}} />;
}`,
  'save-bar': `function Example() {
  const [saving, setSaving] = useState(false);
  return <SaveBar saving={saving} onSave={() => setSaving(true)} onDiscard={() => setSaving(false)} />;
}`,
  badge: `function Example() {
  return (
    <div className="row">
      <Badge tone="success">Published</Badge>
      <Badge tone="warning">In review</Badge>
      <Badge tone="neutral" dot>Draft</Badge>
    </div>
  );
}`,
  progress: `function Example() {
  return <ProgressBar label="Uploading…" value={64} />;
}`,
  spinner: `function Example() {
  return <Spinner label="Loading tokens" />;
}`,
  skeleton: `function Example() {
  return (
    <div className="row" style={{ alignItems: 'flex-start', flexWrap: 'nowrap', width: 320 }}>
      <Skeleton variant="avatar" />
      <Skeleton lines={3} />
    </div>
  );
}`,
  'empty-state': `function Example() {
  return <EmptyState title="No components yet" description="Add your first component to start your library."
    icon={<Icon name="plus" size={22} />} action={<Button size="sm">Add component</Button>} />;
}`,
  dialog: `function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Unsaved changes"
        actions={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Save changes</Button></>}>
        Do you want to save or discard your changes?
      </Dialog>
    </>
  );
}`,
  drawer: `function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Filters</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Filters" footer={<Button block onClick={() => setOpen(false)}>Apply</Button>}>
        <p>Filter controls go here.</p>
      </Drawer>
    </>
  );
}`,
  'action-sheet': `function Example() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Share</Button>
      <ActionSheet open={open} title="Share" onCancel={() => setOpen(false)} onSelect={() => setOpen(false)}
        actions={[{ id: 'copy', label: 'Copy link' }, { id: 'json', label: 'Export as JSON' }, { id: 'delete', label: 'Delete brand', danger: true }]} />
    </>
  );
}`,
  popover: `function Example() {
  return (
    <Popover trigger="Share" label="Share brand">
      <b className="t-small">Share brand</b>
      <p className="help">Anyone with the link can view it.</p>
    </Popover>
  );
}`,
  tooltip: `function Example() {
  return (
    <Tooltip content="Copy token name">
      <IconButton label="Copy" icon={<Icon name="file" />} variant="outline" />
    </Tooltip>
  );
}`,
  card: `function Example() {
  return (
    <Card variant="outline" style={{ maxWidth: 300 }}>
      <b>Acme Design</b>
      <p className="t-small muted">One source of truth: the same JSON read by Figma, CSS and your agent.</p>
    </Card>
  );
}`,
  table: `function Example() {
  const rows = [
    { token: 'primary-solid', status: 'Published' },
    { token: 'text-primary', status: 'Draft' },
  ];
  return <DataTable caption="Tokens" rows={rows} rowKey={(r) => r.token} selectedKeys={['text-primary']}
    columns={[{ key: 'token', header: 'Token' }, { key: 'status', header: 'Status', render: (r) => <Badge tone={r.status === 'Published' ? 'success' : 'neutral'}>{r.status}</Badge> }]} />;
}`,
  list: `function Example() {
  return <List label="Team" items={[
    { id: '1', leading: <Avatar name="Maya Díaz" />, title: 'Maya Díaz', subtitle: 'Designer' },
    { id: '2', leading: <Avatar name="Jon Lee" tone={2} />, title: 'Jon Lee', subtitle: 'Developer' },
  ]} />;
}`,
  avatar: `function Example() {
  return (
    <div className="row">
      <Avatar name="Maya Díaz" size="lg" online />
      <AvatarStack><Avatar name="Ana B" tone={2} /><Avatar name="Carl D" tone={3} /><Avatar name="Eva F" tone={4} /></AvatarStack>
    </div>
  );
}`,
  stat: `function Example() {
  return <Stat label="Workspace readiness" value={98} unit="%" delta="+6%" direction="up" />;
}`,
  accordion: `function Example() {
  return <Accordion defaultOpen={['tokens']} items={[
    { id: 'tokens', title: 'What are design tokens?', content: 'Named values for colour, type, spacing and more.' },
    { id: 'dark', title: 'How is dark mode built?', content: 'Every ramp has a dark twin; roles point to the right step.' },
  ]} />;
}`,
  timeline: `function Example() {
  return <Timeline events={[
    { id: '1', title: 'Published v2.1', time: '2 min ago' },
    { id: '2', title: 'Primary changed', time: '1 h ago' },
  ]} />;
}`,
  code: `function Example() {
  return <CodeBlock code={'.button {\\n  background: var(--primary-solid);\\n}'} />;
}`,
  divider: `function Example() {
  return <div className="col"><span>Above</span><Divider /><span>Below</span></div>;
}`,
  kbd: `function Example() {
  return <p>Search <Kbd keys={['⌘', 'K']} /></p>;
}`,
  'inline-edit': `function Example() {
  const [name, setName] = useState('Autumn launch');
  return <InlineEdit label="Campaign name" value={name} onSave={(v) => (v.trim() ? setName(v) : 'The name cannot be empty.')} />;
}`,
  'time-picker': `function Example() {
  const [time, setTime] = useState<string | null>('10:00');
  return <TimePicker label="Start time" value={time} onChange={setTime} min="09:00" max="18:00" />;
}`,
  'color-picker': `function Example() {
  const [color, setColor] = useState('#7c5cff');
  return <ColorPicker value={color} onChange={setColor} variant="full" />;
}`,
  'context-menu': `function Example() {
  const [last, setLast] = useState('');
  return (
    <ContextMenu onSelect={setLast} items={[
      { id: 'rename', label: 'Rename', shortcut: 'F2' },
      { id: 'duplicate', label: 'Duplicate', shortcut: '⌘D' },
      'separator',
      { id: 'delete', label: 'Delete', danger: true },
    ]}>
      <div className="ctx-area">Right-click here{last && ' · last: ' + last}</div>
    </ContextMenu>
  );
}`,
  'page-banner': `function Example() {
  const [open, setOpen] = useState(true);
  return open ? <PageBanner tone="promo" title="Autumn sale:" action={{ label: 'See plans', href: '#pricing' }} onDismiss={() => setOpen(false)}>20% off every plan until Sunday.</PageBanner> : null;
}`,
  hero: `function Example() {
  return <Hero variant="split" eyebrow="Design system 2.1" title="Design once. Ship everywhere."
    description="Tokens, components and docs from a single source, ready for Figma, the web and your AI agents."
    actions={<><Button size="lg">Start free</Button><Button size="lg" variant="outline">Watch demo</Button></>} />;
}`,
  'media-card': `function Example() {
  return <MediaCard eyebrow="Guide · 6 min" title="How to name your tokens"
    description="Primitive, semantic and component: three levels that scale without breaking."
    actions={<><Button size="sm">Read</Button><Button size="sm" variant="ghost">Save</Button></>} />;
}`,
  'product-card': `function Example() {
  const [fav, setFav] = useState(false);
  return <ProductCard name="Nordic lamp" price="€63.20" compareAt="€79.00" rating={4} reviews={128}
    badge={<Badge tone="critical">−20%</Badge>} favorite={fav} onFavorite={setFav} onAdd={() => {}} />;
}`,
  'pricing-card': `function Example() {
  return (
    <div className="row" style={{ alignItems: 'stretch', paddingTop: 12 }}>
      <PricingCard name="Basic" description="To get started" price="€0" features={[{ label: 'Unlimited brands' }, { label: 'Sub-brands', included: false }]} action={<Button variant="outline" block>Start free</Button>} />
      <PricingCard featured name="Team" description="For product teams" price="€24" features={[{ label: 'Unlimited brands' }, { label: 'Sub-brands' }]} action={<Button block>Try 14 days</Button>} />
    </div>
  );
}`,
  'profile-card': `function Example() {
  return <ProfileCard variant="cover" name="Maya Díaz" role="Systems designer · Madrid" online
    stats={[{ label: 'Tokens', value: 128 }, { label: 'Components', value: 46 }]}
    actions={<><Button size="sm">Follow</Button><Button size="sm" variant="outline">Message</Button></>} />;
}`,
  carousel: `function Example() {
  return (
    <Carousel label="What's new">
      <CarouselSlide strong title="New collection" caption="Autumn 2026" />
      <CarouselSlide title="Free shipping" caption="On orders over €50" />
      <CarouselSlide strong title="Tokens 2.1" caption="Better dark mode" />
    </Carousel>
  );
}`,
};

/** A single file that renders every example: used by the render test and as a showcase page. */
export function reactShowcase(ids, from = './ds') {
  const names = ids.filter((id) => EXAMPLES[id]).map((id) => ({ id, name: reactName(id) }));
  return [
    `import { useState } from 'react';`,
    `import { DesignSystemProvider, Icon, ${[...new Set(names.flatMap(({ id }) => exportedNames(id)))].join(', ')} } from '${from}';`,
    ``,
    ...names.map(({ id, name }) => EXAMPLES[id].replace('function Example()', `function Example${name}()`)),
    ``,
    `export default function Showcase({ theme }: { theme?: 'light' | 'dark' }) {`,
    `  return (`,
    `    <DesignSystemProvider theme={theme} style={{ padding: 24, display: 'grid', gap: 24 }}>`,
    ...names.map(({ id, name }) => `      <section data-id="${id}"><h2 className="t-h4">${name}</h2><div style={{ marginTop: 12 }}><Example${name} /></div></section>`),
    `    </DesignSystemProvider>`,
    `  );`,
    `}`,
    ``,
  ].join('\n');
}

/** Exported names of a component file plus helpers used by its example. */
function exportedNames(id) {
  const c = reactComponent(id);
  const own = [...c.text.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1]);
  const all = new Set(REACT_READY.flatMap((x) => [...reactComponent(x).text.matchAll(/^export (?:const|function) (\w+)/gm)].map((m) => m[1])));
  const used = [...EXAMPLES[id].matchAll(/<([A-Z]\w+)/g)].map((m) => m[1]).filter((n) => all.has(n));
  return [...new Set([...own, ...used])];
}

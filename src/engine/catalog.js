// Component inventory distilled from today's reference design systems.
// "refs" says which public systems ship an equivalent component, so a team can
// compare naming and behaviour. Only the inventory is shared; the look comes
// entirely from your own tokens.

export const SYSTEMS = {
  m3: 'Material 3',
  carbon: 'IBM Carbon',
  polaris: 'Shopify Polaris',
  atlassian: 'Atlassian DS',
  primer: 'GitHub Primer',
  fluent: 'Fluent 2',
  spectrum: 'Adobe Spectrum',
  radix: 'Radix / shadcn',
};

export const CATEGORIES = [
  { id: 'actions', name: 'Actions' },
  { id: 'inputs', name: 'Inputs & forms' },
  { id: 'selection', name: 'Selection' },
  { id: 'navigation', name: 'Navigation' },
  { id: 'feedback', name: 'Feedback & status' },
  { id: 'overlays', name: 'Overlays' },
  { id: 'data', name: 'Data display' },
  { id: 'layout', name: 'Layout & structure' },
];

const ALL = ['m3', 'carbon', 'polaris', 'atlassian', 'primer', 'fluent', 'spectrum', 'radix'];

export const COMPONENTS = [
  // Actions
  { id: 'button', name: 'Button', cat: 'actions', core: true, refs: ALL,
    desc: 'Triggers an action. One primary per view; secondary and tertiary for the rest.',
    variants: ['primary', 'secondary', 'outline', 'ghost', 'destructive'], sizes: ['sm', 'md', 'lg'],
    states: ['default', 'hover', 'focus', 'disabled', 'loading'],
    tokens: { 'height-sm': 32, 'height-md': 40, 'height-lg': 48, 'padding-x': 16, 'gap': 8, 'font-weight': 600 } },
  { id: 'icon-button', name: 'Icon button', cat: 'actions', core: true, refs: ['m3', 'carbon', 'atlassian', 'primer', 'fluent', 'spectrum', 'radix'],
    desc: 'A square button with only an icon. Always needs an accessible label.',
    variants: ['solid', 'outline', 'ghost'], sizes: ['sm', 'md', 'lg'], states: ['default', 'hover', 'focus', 'disabled'],
    tokens: { 'size-md': 40 } },
  { id: 'button-group', name: 'Button group', cat: 'actions', refs: ['m3', 'carbon', 'polaris', 'atlassian', 'fluent', 'spectrum'],
    desc: 'Related actions joined into one control, such as a segmented toolbar.',
    variants: ['attached', 'spaced'], sizes: ['md'], states: ['default', 'selected'], tokens: {} },
  { id: 'link', name: 'Link', cat: 'actions', core: true, refs: ALL,
    desc: 'Navigates to another page or anchor. Underlined in body text.',
    variants: ['inline', 'standalone', 'subtle'], sizes: ['md'], states: ['default', 'hover', 'visited', 'focus'], tokens: { 'underline-offset': 3 } },
  { id: 'fab', name: 'Floating action', cat: 'actions', refs: ['m3', 'fluent'],
    desc: 'The single most important action on a screen, floating above content.',
    variants: ['regular', 'extended'], sizes: ['md', 'lg'], states: ['default', 'hover'], tokens: { 'size': 56 } },

  // Inputs
  { id: 'text-field', name: 'Text field', cat: 'inputs', core: true, refs: ALL,
    desc: 'Single-line input with label, help text and error message.',
    variants: ['outline', 'filled'], sizes: ['sm', 'md', 'lg'], states: ['default', 'focus', 'error', 'disabled', 'read-only'],
    tokens: { 'height-md': 40, 'padding-x': 12, 'label-gap': 6 } },
  { id: 'textarea', name: 'Textarea', cat: 'inputs', core: true, refs: ALL,
    desc: 'Multi-line input that grows with its content.', variants: ['outline'], sizes: ['md'], states: ['default', 'focus', 'error', 'disabled'], tokens: { 'min-rows': 3 } },
  { id: 'select', name: 'Select', cat: 'inputs', core: true, refs: ALL,
    desc: 'Choose one option from a short list.', variants: ['outline', 'filled'], sizes: ['sm', 'md', 'lg'], states: ['default', 'open', 'error', 'disabled'], tokens: {} },
  { id: 'combobox', name: 'Combobox', cat: 'inputs', refs: ['m3', 'carbon', 'polaris', 'atlassian', 'fluent', 'spectrum', 'radix'],
    desc: 'Searchable select with typeahead filtering.', variants: ['single', 'multi'], sizes: ['md'], states: ['default', 'open'], tokens: {} },
  { id: 'search', name: 'Search field', cat: 'inputs', refs: ALL,
    desc: 'Text field with a search icon and clear button.', variants: ['outline', 'filled'], sizes: ['md'], states: ['default', 'focus'], tokens: {} },
  { id: 'number-input', name: 'Number input', cat: 'inputs', refs: ['carbon', 'spectrum', 'fluent', 'atlassian'],
    desc: 'Numeric field with stepper buttons.', variants: ['default'], sizes: ['md'], states: ['default', 'disabled'], tokens: {} },
  { id: 'otp', name: 'One-time code', cat: 'inputs', refs: ['radix', 'polaris'],
    desc: 'Segmented boxes for verification codes.', variants: ['default'], sizes: ['md'], states: ['default', 'filled', 'error'], tokens: { 'cell-size': 40 } },
  { id: 'date-picker', name: 'Date picker', cat: 'inputs', refs: ALL,
    desc: 'Calendar grid to pick a date or range.', variants: ['single', 'range'], sizes: ['md'], states: ['default', 'selected', 'today'], tokens: { 'cell-size': 36 } },
  { id: 'file-upload', name: 'File upload', cat: 'inputs', refs: ['carbon', 'polaris', 'atlassian', 'spectrum'],
    desc: 'Drop zone plus file list with progress.', variants: ['dropzone', 'button'], sizes: ['md'], states: ['idle', 'dragging', 'uploading', 'error'], tokens: {} },
  { id: 'slider', name: 'Slider', cat: 'inputs', refs: ALL,
    desc: 'Pick a value or range along a track.', variants: ['single', 'range'], sizes: ['md'], states: ['default', 'focus', 'disabled'], tokens: { 'track-height': 4, 'thumb-size': 18 } },

  // Selection
  { id: 'checkbox', name: 'Checkbox', cat: 'selection', core: true, refs: ALL,
    desc: 'Toggle one or many independent options.', variants: ['default'], sizes: ['md'], states: ['unchecked', 'checked', 'indeterminate', 'disabled'], tokens: { 'size': 18 } },
  { id: 'radio', name: 'Radio group', cat: 'selection', core: true, refs: ALL,
    desc: 'Choose exactly one option from a visible set.', variants: ['default', 'card'], sizes: ['md'], states: ['unchecked', 'checked', 'disabled'], tokens: { 'size': 18 } },
  { id: 'switch', name: 'Switch', cat: 'selection', core: true, refs: ALL,
    desc: 'Turns a setting on or off immediately.', variants: ['default'], sizes: ['sm', 'md'], states: ['off', 'on', 'disabled'], tokens: { 'width': 36, 'height': 20 } },
  { id: 'segmented', name: 'Segmented control', cat: 'selection', refs: ['m3', 'polaris', 'primer', 'fluent', 'spectrum', 'radix'],
    desc: 'Switch between a few exclusive views.', variants: ['default'], sizes: ['sm', 'md'], states: ['default', 'selected'], tokens: {} },
  { id: 'chip', name: 'Chip / Tag', cat: 'selection', core: true, refs: ALL,
    desc: 'Compact element for filters, choices or metadata.', variants: ['filter', 'input', 'static'], sizes: ['sm', 'md'], states: ['default', 'selected', 'removable'], tokens: { 'height': 28 } },

  // Navigation
  { id: 'tabs', name: 'Tabs', cat: 'navigation', core: true, refs: ALL,
    desc: 'Organise related content into views at the same level.', variants: ['line', 'pill'], sizes: ['md'], states: ['default', 'selected', 'disabled'], tokens: { 'indicator-height': 2 } },
  { id: 'breadcrumb', name: 'Breadcrumb', cat: 'navigation', refs: ALL,
    desc: 'Shows where a page sits in the hierarchy.', variants: ['default'], sizes: ['md'], states: ['default', 'current'], tokens: {} },
  { id: 'pagination', name: 'Pagination', cat: 'navigation', refs: ALL,
    desc: 'Move between pages of a long list.', variants: ['numbered', 'simple'], sizes: ['md'], states: ['default', 'current', 'disabled'], tokens: {} },
  { id: 'sidebar', name: 'Side navigation', cat: 'navigation', core: true, refs: ALL,
    desc: 'Primary app navigation in a vertical list.', variants: ['default', 'collapsed'], sizes: ['md'], states: ['default', 'active'], tokens: { 'width': 240, 'item-height': 36 } },
  { id: 'topbar', name: 'Top app bar', cat: 'navigation', refs: ['m3', 'carbon', 'polaris', 'atlassian', 'primer', 'fluent'],
    desc: 'Header with product name, search and account.', variants: ['default'], sizes: ['md'], states: ['default'], tokens: { 'height': 56 } },
  { id: 'stepper', name: 'Stepper', cat: 'navigation', refs: ['m3', 'carbon', 'atlassian', 'spectrum'],
    desc: 'Progress through a multi-step flow.', variants: ['horizontal'], sizes: ['md'], states: ['complete', 'current', 'upcoming'], tokens: {} },
  { id: 'menu', name: 'Menu', cat: 'navigation', core: true, refs: ALL,
    desc: 'A list of actions shown on demand.', variants: ['default'], sizes: ['md'], states: ['default', 'hover', 'destructive'], tokens: { 'item-height': 32 } },

  // Feedback
  { id: 'alert', name: 'Alert / Banner', cat: 'feedback', core: true, refs: ALL,
    desc: 'Inline message about the state of a page or section.', variants: ['info', 'success', 'warning', 'critical'], sizes: ['md'], states: ['default', 'dismissible'], tokens: {} },
  { id: 'toast', name: 'Toast', cat: 'feedback', core: true, refs: ALL,
    desc: 'Brief, auto-dismissing confirmation of an action.', variants: ['neutral', 'success', 'critical'], sizes: ['md'], states: ['default'], tokens: { 'width': 360 } },
  { id: 'badge', name: 'Badge', cat: 'feedback', core: true, refs: ALL,
    desc: 'Short status label or count.', variants: ['neutral', 'accent', 'success', 'warning', 'critical', 'info'], sizes: ['sm', 'md'], states: ['default'], tokens: { 'height': 22 } },
  { id: 'progress', name: 'Progress bar', cat: 'feedback', core: true, refs: ALL,
    desc: 'Determinate or indeterminate progress.', variants: ['linear', 'circular'], sizes: ['md'], states: ['default', 'error'], tokens: { 'height': 6 } },
  { id: 'spinner', name: 'Spinner', cat: 'feedback', refs: ALL,
    desc: 'Indeterminate loading for short waits.', variants: ['default'], sizes: ['sm', 'md', 'lg'], states: ['default'], tokens: {} },
  { id: 'skeleton', name: 'Skeleton', cat: 'feedback', refs: ['m3', 'carbon', 'polaris', 'atlassian', 'fluent', 'spectrum', 'radix'],
    desc: 'Placeholder shapes while content loads.', variants: ['text', 'block', 'avatar'], sizes: ['md'], states: ['default'], tokens: {} },
  { id: 'empty-state', name: 'Empty state', cat: 'feedback', refs: ['carbon', 'polaris', 'atlassian', 'primer', 'spectrum'],
    desc: 'What to show and do when there is no data yet.', variants: ['default'], sizes: ['md'], states: ['default'], tokens: {} },

  // Overlays
  { id: 'dialog', name: 'Dialog / Modal', cat: 'overlays', core: true, refs: ALL,
    desc: 'Focused task or confirmation that blocks the page.', variants: ['default', 'destructive'], sizes: ['sm', 'md', 'lg'], states: ['default'], tokens: { 'width-md': 480 } },
  { id: 'drawer', name: 'Drawer / Sheet', cat: 'overlays', refs: ['m3', 'carbon', 'atlassian', 'fluent', 'spectrum', 'radix'],
    desc: 'Panel that slides in from an edge.', variants: ['right', 'bottom'], sizes: ['md'], states: ['default'], tokens: { 'width': 400 } },
  { id: 'popover', name: 'Popover', cat: 'overlays', refs: ALL,
    desc: 'Rich, non-modal content anchored to a trigger.', variants: ['default'], sizes: ['md'], states: ['default'], tokens: {} },
  { id: 'tooltip', name: 'Tooltip', cat: 'overlays', core: true, refs: ALL,
    desc: 'Short hint on hover or focus.', variants: ['default'], sizes: ['sm'], states: ['default'], tokens: { 'max-width': 240 } },

  // Data display
  { id: 'card', name: 'Card', cat: 'data', core: true, refs: ALL,
    desc: 'Container grouping content and actions about one subject.', variants: ['elevated', 'outline', 'filled'], sizes: ['md'], states: ['default', 'interactive'], tokens: {} },
  { id: 'table', name: 'Data table', cat: 'data', core: true, refs: ALL,
    desc: 'Rows and columns with sorting and selection.', variants: ['default', 'zebra'], sizes: ['compact', 'md'], states: ['default', 'selected', 'hover'], tokens: { 'row-height': 44 } },
  { id: 'list', name: 'List', cat: 'data', refs: ALL,
    desc: 'Vertical items with leading and trailing content.', variants: ['default'], sizes: ['md'], states: ['default', 'hover'], tokens: {} },
  { id: 'avatar', name: 'Avatar', cat: 'data', core: true, refs: ALL,
    desc: 'Person or entity image, initials or icon; also stacked.', variants: ['image', 'initials'], sizes: ['sm', 'md', 'lg'], states: ['default', 'online'], tokens: { 'size-md': 32 } },
  { id: 'stat', name: 'Stat / KPI', cat: 'data', refs: ['polaris', 'carbon', 'atlassian'],
    desc: 'Headline number with trend.', variants: ['default'], sizes: ['md'], states: ['up', 'down'], tokens: {} },
  { id: 'accordion', name: 'Accordion', cat: 'data', refs: ALL,
    desc: 'Stacked sections that expand and collapse.', variants: ['default'], sizes: ['md'], states: ['collapsed', 'expanded'], tokens: {} },
  { id: 'timeline', name: 'Timeline', cat: 'data', refs: ['primer', 'atlassian', 'fluent'],
    desc: 'Chronological events with markers.', variants: ['default'], sizes: ['md'], states: ['default'], tokens: {} },
  { id: 'code', name: 'Code block', cat: 'data', refs: ['carbon', 'primer', 'atlassian'],
    desc: 'Monospace snippet with copy action.', variants: ['inline', 'block'], sizes: ['md'], states: ['default'], tokens: {} },

  // Layout
  { id: 'divider', name: 'Divider', cat: 'layout', refs: ALL,
    desc: 'Separates groups of content.', variants: ['horizontal', 'vertical'], sizes: ['md'], states: ['default'], tokens: {} },
  { id: 'kbd', name: 'Keyboard key', cat: 'layout', refs: ['primer', 'radix', 'spectrum'],
    desc: 'Shows a keyboard shortcut.', variants: ['default'], sizes: ['sm'], states: ['default'], tokens: {} },
];

export const CORE_IDS = COMPONENTS.filter((c) => c.core).map((c) => c.id);

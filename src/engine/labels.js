// Spanish labels for variant, size and state ids (the ids stay in English: they are props).
export const VAL_ES = {
  primary: 'principal', secondary: 'secundario', outline: 'contorno', ghost: 'fantasma', destructive: 'destructivo',
  solid: 'sólido', attached: 'unidos', spaced: 'separados', inline: 'en línea', standalone: 'independiente', subtle: 'sutil',
  regular: 'normal', extended: 'extendido', floating: 'flotante', filled: 'relleno', single: 'simple', multi: 'múltiple',
  dropzone: 'zona de arrastre', button: 'botón', range: 'rango', card: 'tarjeta', filter: 'filtro', input: 'entrada', static: 'estático',
  display: 'solo lectura', line: 'línea', pill: 'píldora', numbered: 'numerada', simple: 'simple', collapsed: 'contraída',
  horizontal: 'horizontal', vertical: 'vertical', neutral: 'neutro', tertiary: 'terciario', success: 'éxito', warning: 'aviso',
  critical: 'crítico', info: 'info', linear: 'lineal', circular: 'circular', text: 'texto', block: 'bloque', avatar: 'avatar',
  right: 'derecha', bottom: 'inferior', elevated: 'elevada', zebra: 'cebra', image: 'imagen', initials: 'iniciales',
  default: 'por defecto', hover: 'hover', focus: 'foco', disabled: 'deshabilitado', loading: 'cargando', selected: 'seleccionado',
  visited: 'visitado', error: 'error', 'read-only': 'solo lectura', open: 'abierto', idle: 'en reposo', dragging: 'arrastrando',
  uploading: 'subiendo', unchecked: 'sin marcar', checked: 'marcado', indeterminate: 'indeterminado', off: 'apagado', on: 'encendido',
  removable: 'eliminable', current: 'actual', active: 'activo', badge: 'con badge', complete: 'completado', upcoming: 'pendiente',
  dismissible: 'descartable', saving: 'guardando', today: 'hoy', interactive: 'interactiva', up: 'sube', down: 'baja',
  expanded: 'expandido', compact: 'compacta', sm: 'S', md: 'M', lg: 'L',
  // Phase 2 values
  view: 'vista', editing: 'editando', list: 'lista', swatches: 'muestras', full: 'completo', closed: 'cerrado',
  promo: 'promoción', centered: 'centrado', split: 'partido', sale: 'en oferta', 'sold-out': 'agotado', featured: 'destacado',
  cover: 'con portada', slides: 'diapositivas', peek: 'con asomo',
};

export const valueLabel = (x) => VAL_ES[x] ?? x;

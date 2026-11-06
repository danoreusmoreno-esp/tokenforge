import { Icon } from './Icons.jsx';

const STEPS = {
  brief: { n: 1, t: 'Bases', d: 'Seis preguntas que generan la primera versión del sistema.' },
  foundations: { n: 2, t: 'Foundations', d: 'Revisa color, tipografía, espaciado y contraste.' },
  components: { n: 3, t: 'Componentes', d: 'Elige qué componentes entran y cómo se mueven.' },
  board: { n: 4, t: 'Tablero', d: 'Mira todo junto, en claro y en oscuro, antes de entregar.' },
  code: { n: 5, t: 'Exportar', d: 'Copia o descarga los archivos para código, Figma y agentes de IA.' },
};

/** The one obvious next action at the end of each screen (Fogg: a trigger when ability is high). */
export default function NextStep({ to, go, done }) {
  const s = STEPS[to];
  return (
    <nav className="next-step" aria-label="Siguiente paso">
      <div className="ns-txt">
        <span className="muted small">{done ?? 'Cuando lo tengas'}</span>
        <b>Siguiente: {s.t}</b>
        <span className="muted">{s.d}</span>
      </div>
      <button className="pill dark" onClick={() => go(to)}>Ir a {s.t}<Icon name="chevRight" size={16} /></button>
    </nav>
  );
}

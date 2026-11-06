import { createContext, useContext } from 'react';

// The brand's CSS variables. Only "live" areas (previews, board, specimens)
// receive them; the app chrome around them keeps its own neutral tokens.
export const BrandVars = createContext({});

// The brand (for per-component motion) and its compiled spring, shared with previews.
export const MotionCfg = createContext({ brand: null, spring: { easing: 'linear', ms: 0 } });

export function Live({ as: Tag = 'div', className = '', style, children, ...rest }) {
  const vars = useContext(BrandVars);
  return <Tag className={`ds live ${className}`} style={{ ...vars, ...style }} {...rest}>{children}</Tag>;
}

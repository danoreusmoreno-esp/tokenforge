import { createContext, useContext } from 'react';

// The brand's CSS variables. Only "live" areas (previews, board, specimens)
// receive them; the app chrome around them keeps its own neutral tokens.
export const BrandVars = createContext({});

export function Live({ as: Tag = 'div', className = '', style, children, ...rest }) {
  const vars = useContext(BrandVars);
  return <Tag className={`ds live ${className}`} style={{ ...vars, ...style }} {...rest}>{children}</Tag>;
}

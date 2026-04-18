import { forwardRef, useEffect } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { injectSvgFilter } from './index';

export interface IceGlassProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

function mergeIceGlassClass(userClass: string | undefined): string {
  if (!userClass) return 'ice-glass';
  return userClass.split(/\s+/).includes('ice-glass')
    ? userClass
    : `ice-glass ${userClass}`;
}

/**
 * Ice-glass container for React.
 *
 *   import { IceGlass } from 'ice-glass/react';
 *   import 'ice-glass/style.css';
 *
 *   <IceGlass className="card">...</IceGlass>
 *
 * Renders a relative wrapper with four layers (distort / blur / content /
 * edge). The SVG filter is injected once on mount. The root is flagged
 * with `data-ice-ready="1"` so the optional `ice-glass/auto` runtime
 * observer will never double-hydrate it.
 */
export const IceGlass = forwardRef<HTMLDivElement, IceGlassProps>(
  function IceGlass({ children, className, ...rest }, ref) {
    useEffect(() => {
      injectSvgFilter();
    }, []);

    return (
      <div
        {...rest}
        ref={ref}
        className={mergeIceGlassClass(className)}
        data-ice-ready="1"
      >
        <div className="ig-distort" aria-hidden="true" />
        <div className="ig-blur" aria-hidden="true" />
        <div className="ig-content">{children}</div>
        <div className="ig-edge" aria-hidden="true" />
      </div>
    );
  },
);

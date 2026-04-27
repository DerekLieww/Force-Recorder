import type { ColorState } from '../../store/trainingStore';

interface Props {
  activeHand: 'left' | 'right';
  colorState: ColorState;
}

const COLOR: Record<ColorState, string> = {
  neutral: '#e2e8f0',
  orange: '#f97316',
  green: '#22c55e',
};

function HandSVG({ side, active, color }: { side: 'left' | 'right'; active: boolean; color: string }) {
  const glowId = `glow-${side}-${color.replace('#', '')}`;
  // Left hand: thumb on right side. Right hand: thumb on left side.
  const thumbTransform = side === 'left'
    ? 'rotate(12 46 35)'
    : 'rotate(-12 6 35)';
  const thumbX = side === 'left' ? 38 : -2;

  return (
    <div style={{ textAlign: 'center', opacity: active ? 1 : 0.3 }}>
      <svg width="52" height="68" viewBox="0 0 52 68" xmlns="http://www.w3.org/2000/svg">
        {active && (
          <defs>
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        <g filter={active ? `url(#${glowId})` : undefined}>
          {/* Four fingers as solid block — no gaps */}
          <rect x="8" y="0" width="36" height="36" rx="9" fill={active ? color : '#94a3b8'} />
          {/* Palm overlaps fingers — no gap between finger block and palm */}
          <rect x="4" y="26" width="44" height="38" rx="9" fill={active ? color : '#94a3b8'} />
          {/* Thumb — protrudes from correct side */}
          <rect
            x={thumbX}
            y="22"
            width="16"
            height="26"
            rx="8"
            fill={active ? color : '#94a3b8'}
            transform={thumbTransform}
          />
        </g>
      </svg>
      <div
        style={{
          fontSize: '11px',
          fontWeight: active ? 700 : 400,
          marginTop: '6px',
          color: active ? color : '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {side}
      </div>
    </div>
  );
}

export function HandIndicator({ activeHand, colorState }: Props) {
  const color = COLOR[colorState];

  return (
    <div>
      <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-gray-400 uppercase mb-3">
        Active Hand
      </div>
      <div className="flex gap-8 justify-center">
        <HandSVG side="left" active={activeHand === 'left'} color={color} />
        <HandSVG side="right" active={activeHand === 'right'} color={color} />
      </div>
    </div>
  );
}

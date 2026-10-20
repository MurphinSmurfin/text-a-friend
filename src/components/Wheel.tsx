import { useEffect, useState } from "preact/hooks";
import type { Friend } from "../lib/state.ts";
import {
  RIM,
  fontSize,
  hue,
  label,
  landing,
  sliceCenter,
  slicePath,
} from "../lib/wheel.ts";

type Props = {
  friends: Friend[];
  pickId?: string;
  spinning: boolean;
  onLand: () => void;
};

/** Spins only while `spinning` is true; otherwise it quietly keeps the picked slice under the pointer. */
export function Wheel({ friends, pickId, spinning, onLand }: Props) {
  const n = friends.length;
  const i = friends.findIndex((f) => f.id === pickId);
  const [rotation, setRotation] = useState(() =>
    i < 0 ? 0 : landing(i, n, 0, 0),
  );

  useEffect(() => {
    if (i < 0) return;
    if (!spinning) {
      setRotation((r) => landing(i, n, r, 0));
      return;
    }
    setRotation((r) => landing(i, n, r));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) onLand();
  }, [pickId, spinning, n, i]);

  return (
    <svg
      class="wheel"
      viewBox="-1.05 -1.05 2.1 2.1"
      role="img"
      aria-label="Roulette wheel of your friends"
    >
      <g
        class="rotor"
        style={`transform: rotate(${rotation}deg)`}
        onTransitionEnd={onLand}
      >
        {friends.map((f, k) => (
          <g key={f.id}>
            <path
              d={slicePath(k, n)}
              fill={`hsl(${hue(k)} 70% 45%)`}
              stroke="#fff"
              stroke-width="0.015"
            />
            <text
              transform={`rotate(${sliceCenter(k, n) - 90}) translate(${RIM} 0)`}
              text-anchor="end"
              fill="#fff"
              font-size={fontSize(label(f.name, n).length, n)}
              dominant-baseline="middle"
            >
              {label(f.name, n)}
            </text>
          </g>
        ))}
      </g>
      <path d="M-0.09,-1.04 L0.09,-1.04 L0,-0.86 Z" fill="currentColor" />
    </svg>
  );
}

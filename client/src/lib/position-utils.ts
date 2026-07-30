import type { Position } from '@/types';

// "Chủ thương hiệu" is the sole top-level owner role — never selectable
// through the regular create/change-position UI.
const OWNER_POSITION_NAME = 'Chủ thương hiệu';

export function selectablePositions(positions: Position[]) {
  return positions.filter((p) => p.name !== OWNER_POSITION_NAME);
}

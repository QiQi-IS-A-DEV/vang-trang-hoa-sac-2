export type TreeBranch = { path: string; width: number; depth: number };
export type TreeLeaf = { x: number; y: number; angle: number; size: number; tone: number };
export const treeBranches: TreeBranch[] = [];
export const decorativeLeaves: TreeLeaf[] = [];

let seed = 20426;
function random() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}

function grow(x: number, y: number, angle: number, length: number, width: number, depth: number) {
  angle = Math.max(-172, Math.min(-8, angle));
  const radians = angle * Math.PI / 180;
  const endX = x + Math.cos(radians) * length;
  const endY = y + Math.sin(radians) * length;
  const bend = (random() - 0.5) * length * 0.3;
  treeBranches.push({
    path: `M${x.toFixed(1)} ${y.toFixed(1)} Q${((x + endX) / 2 + bend).toFixed(1)} ${((y + endY) / 2).toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`,
    width, depth,
  });
  if (depth <= 2) {
    const count = depth === 0 ? 8 : 3;
    for (let i = 0; i < count; i++) {
      const radius = random() * 30;
      const spread = random() * Math.PI * 2;
      decorativeLeaves.push({
        x: endX + Math.cos(spread) * radius,
        y: endY + Math.sin(spread) * radius * 0.65,
        angle: angle + (random() - 0.5) * 150,
        size: 5 + random() * 6,
        tone: Math.floor(random() * 5),
      });
    }
  }
  if (depth > 0) {
    grow(endX, endY, angle - 25 - random() * 18, length * (0.63 + random() * 0.1), width * 0.62, depth - 1);
    grow(endX, endY, angle + 23 + random() * 22, length * (0.64 + random() * 0.1), width * 0.62, depth - 1);
  }
}

// An original branching silhouette, rendered as vectors and independent of message data.
grow(398, 552, -92, 128, 23, 0);
for (const branch of [
  [397, 443, -150, 129, 11],
  [407, 414, -123, 140, 10],
  [404, 405, -101, 148, 12],
  [408, 409, -77, 160, 11],
  [416, 440, -39, 157, 12],
  [415, 475, -18, 150, 10],
  [394, 480, -170, 141, 10],
]) grow(branch[0], branch[1], branch[2], branch[3], branch[4], 4);

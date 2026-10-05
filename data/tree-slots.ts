export type TreeSlot = { index: number; x: number; y: number; angle: number };

// Thiết kế 56 vị trí treo lời nhắn (~50 - 60 cái), bố trí đều theo các nhánh cành xòe rộng
const slotDefinitions: { x: number; y: number; angle: number }[] = [
  // Tầng 1: Đỉnh ngọn vươn cao (4 điểm)
  { x: 335, y: 105, angle: -4 },
  { x: 385, y: 92, angle: -2 },
  { x: 430, y: 92, angle: 2 },
  { x: 485, y: 105, angle: 5 },

  // Tầng 2: Nhánh cao (6 điểm)
  { x: 265, y: 148, angle: -7 },
  { x: 325, y: 138, angle: -4 },
  { x: 375, y: 142, angle: -1 },
  { x: 435, y: 142, angle: 2 },
  { x: 490, y: 138, angle: 5 },
  { x: 545, y: 148, angle: 8 },

  // Tầng 3: Tán trên (8 điểm)
  { x: 210, y: 195, angle: -8 },
  { x: 265, y: 188, angle: -5 },
  { x: 320, y: 192, angle: -2 },
  { x: 370, y: 186, angle: -1 },
  { x: 435, y: 186, angle: 2 },
  { x: 485, y: 192, angle: 4 },
  { x: 540, y: 188, angle: 6 },
  { x: 595, y: 195, angle: 9 },

  // Tầng 4: Tán giữa - vươn rộng (10 điểm)
  { x: 165, y: 245, angle: -10 },
  { x: 215, y: 238, angle: -7 },
  { x: 270, y: 242, angle: -4 },
  { x: 325, y: 236, angle: -2 },
  { x: 370, y: 242, angle: 0 },
  { x: 430, y: 242, angle: 1 },
  { x: 480, y: 236, angle: 3 },
  { x: 535, y: 242, angle: 6 },
  { x: 585, y: 238, angle: 8 },
  { x: 635, y: 245, angle: 11 },

  // Tầng 5: Tán giữa dưới (10 điểm)
  { x: 150, y: 295, angle: -12 },
  { x: 200, y: 288, angle: -8 },
  { x: 255, y: 292, angle: -5 },
  { x: 310, y: 286, angle: -2 },
  { x: 365, y: 292, angle: 0 },
  { x: 435, y: 292, angle: 2 },
  { x: 490, y: 286, angle: 4 },
  { x: 545, y: 292, angle: 7 },
  { x: 600, y: 288, angle: 9 },
  { x: 650, y: 295, angle: 12 },

  // Tầng 6: Cành thấp xòe bóng (10 điểm)
  { x: 175, y: 345, angle: -10 },
  { x: 225, y: 338, angle: -7 },
  { x: 275, y: 342, angle: -4 },
  { x: 325, y: 336, angle: -1 },
  { x: 375, y: 342, angle: 0 },
  { x: 425, y: 342, angle: 1 },
  { x: 475, y: 336, angle: 3 },
  { x: 525, y: 342, angle: 5 },
  { x: 575, y: 338, angle: 8 },
  { x: 625, y: 345, angle: 11 },

  // Tầng 7: Nhánh buông lơi dưới cùng (8 điểm)
  { x: 215, y: 390, angle: -8 },
  { x: 265, y: 382, angle: -5 },
  { x: 315, y: 388, angle: -2 },
  { x: 365, y: 382, angle: 0 },
  { x: 435, y: 382, angle: 2 },
  { x: 485, y: 388, angle: 4 },
  { x: 535, y: 382, angle: 7 },
  { x: 585, y: 390, angle: 9 },
];

export const treeSlots: TreeSlot[] = slotDefinitions.map((slot, index) => ({
  index,
  x: slot.x,
  y: slot.y,
  angle: slot.angle,
}));

export const slotsPerTree = treeSlots.length; // 56 slots

export function messageTreePosition(slotIndex: number) {
  return {
    page: Math.floor(slotIndex / slotsPerTree),
    slot: treeSlots[slotIndex % slotsPerTree],
  };
}

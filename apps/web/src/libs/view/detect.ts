import { DetectBbox } from "../types";

// 薬ごとの色マップ
const labelColorMap: Record<string, string> = {
  bron: "#4ECDC4", // ターコイズ
  medicon: "#A260BF", // 紫
  restamin: "#FF6B6B", // 赤系
  pabrongold: "#FFD93D", // 黄色系
};

export function detectView(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  restoreScale: number,
  bboxes: DetectBbox[],
  metadata: any // 追加: metadataを受け取る
) {
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;

  canvas.width = image.width;
  canvas.height = image.height;

  context.drawImage(image, 0, 0, image.width, image.height);

  context.font = "10px Arial";

  bboxes.forEach((bbox) => {
    // ラベル名を取得
    const labelName = metadata.names[bbox.label] || `class_${bbox.label}`;
    const color = labelColorMap[labelName.toLowerCase()] || "salmon"; // デフォルトはsalmon

    context.beginPath();
    context.rect(
      bbox.x * restoreScale,
      bbox.y * restoreScale,
      bbox.w * restoreScale,
      bbox.h * restoreScale
    );
    context.strokeStyle = color;
    context.lineWidth = 4 * ((canvas.width ?? 640) / 640);
    context.stroke();
  });
}

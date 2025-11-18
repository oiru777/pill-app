export function getPillColor(pillName: string): string {
  switch (pillName.toLowerCase()) {
    case "ブロン":
      return "rgba(66, 153, 225, 0.6)";
    case "レスタミン":
      return "rgba(250, 176, 51, 0.6)";
    case "パブロンゴールド":
      return "rgba(245, 223, 77, 0.6)";
    case "メジコン":
      return "rgba(168, 85, 247, 0.6)";
    default:
      return "rgba(160, 160, 160, 0.6)";
  }
}

import mystic from "@/assets/booster-mystic.png";
import inferno from "@/assets/booster-inferno.png";
import box from "@/assets/booster-box-emerald.png";

export const boosterImages: Record<string, string> = {
  "booster-mystic": mystic,
  "booster-inferno": inferno,
  "booster-box-emerald": box,
};

export function boosterImage(key: string) {
  return boosterImages[key] ?? mystic;
}

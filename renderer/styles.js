const SKINS = ["#f9e0c8", "#f3c7a8", "#e0a07a", "#c68642", "#8d5524"];

const HAIR_COLORS = [
  { hex: "#1a1a1a" },
  { hex: "#3b2414" },
  { hex: "#6b3a1f" },
  { hex: "#922b21" },
  { hex: "#c45c26" },
  { hex: "#e8dcc8" },
  { hex: "#c4b59a" },
  { hex: "#f4f1ea" },
  { hex: "#ffb6c1" },
  { hex: "#c3a2e2" },
];

const EYE_COLORS = [
  { hex: "#1a1a1a" },
  { hex: "#3d2314" },
  { hex: "#8b5a2b" },
  { hex: "#4a7c4e" },
  { hex: "#89cff0" },
  { hex: "#2c4a7c" },
  { hex: "#7a7a7a" },
];

const CLOTH_COLORS = [
  { hex: "#FFB6C1" },
  { hex: "#FF9AA2" },
  { hex: "#EFA6AA" },
  { hex: "#FFA69E" },
  { hex: "#A7D8F0" },
  { hex: "#89CFF0" },
  { hex: "#77DDDD" },
  { hex: "#72E0D5" },
  { hex: "#C5E1A5" },
  { hex: "#F8DE7E" },
  { hex: "#FFD3A5" },
  { hex: "#F7C59F" },
  { hex: "#F4A582" },
  { hex: "#D8BFD8" },
  { hex: "#C3A2E2" },
  { hex: "#EAE0C8" },
];

const HAIR = [
  { id: "long_straight", tags: ["feminine"], draw: "long" },
  { id: "long_wavy", tags: ["feminine"], draw: "wavy" },
  { id: "bob_cut", tags: ["feminine"], draw: "bob" },
  { id: "hime_cut", tags: ["feminine"], draw: "hime" },
  { id: "pixie_cut", tags: ["feminine"], draw: "pixie" },
  { id: "twin_tails", tags: ["feminine"], draw: "twins" },
  { id: "high_ponytail", tags: ["feminine"], draw: "pony" },
  { id: "messy_bun", tags: ["feminine"], draw: "bun" },
  { id: "wolf_cut", tags: ["feminine", "masculine", "unisex"], draw: "wolf" },
  { id: "buzz_cut", tags: ["masculine"], draw: "buzz" },
  { id: "crew_cut", tags: ["masculine"], draw: "crew" },
  { id: "french_crop", tags: ["masculine"], draw: "crop" },
  { id: "comma_hair", tags: ["masculine"], draw: "comma" },
  { id: "middle_part", tags: ["masculine"], draw: "part" },
  { id: "mullet", tags: ["masculine", "unisex"], draw: "mullet" },
  { id: "man_bun", tags: ["masculine"], draw: "manbun" },
  { id: "curly", tags: ["unisex"], draw: "curly" },
  { id: "shoulder_length", tags: ["unisex"], draw: "shoulder" },
  { id: "braided", tags: ["unisex"], draw: "braid" },
];

const TOPS = [
  { id: "tshirt", sil: "fit" },
  { id: "oversized", sil: "over" },
  { id: "baby_tee", sil: "crop" },
  { id: "tank", sil: "tank" },
  { id: "hoodie", sil: "hoodie" },
  { id: "turtleneck", sil: "turtle" },
  { id: "sweater", sil: "over" },
];

const BOTTOMS = [
  { id: "skinny", sil: "pants" },
  { id: "baggy", sil: "baggy" },
  { id: "sweats", sil: "pants" },
  { id: "denim_shorts", sil: "shorts" },
  { id: "mini_skirt", sil: "skirt" },
  { id: "pleated_skirt", sil: "skirt" },
];

const DRESSES = [
  { id: "sundress", sil: "short" },
  { id: "mini_dress", sil: "short" },
  { id: "slip", sil: "midi" },
  { id: "maxi", sil: "long" },
  { id: "pinafore", sil: "short" },
  { id: "cottagecore", sil: "long" },
];

const ACCESSORIES = [
  { id: "none" },
  { id: "bow" },
  { id: "flower" },
  { id: "glasses" },
];

function hairForSex(sex) {
  const tag = sex === "male" ? "masculine" : "feminine";
  return HAIR.filter((h) => h.tags.includes(tag) || h.tags.includes("unisex"));
}

function bottomsForSex(sex) {
  if (sex === "male") return BOTTOMS.filter((b) => b.sil !== "skirt");
  return BOTTOMS;
}

function defaultAppearance(sex = "female") {
  return {
    sex,
    skin: SKINS[0],
    hair: sex === "male" ? "crew_cut" : "bob_cut",
    hairColor: HAIR_COLORS[sex === "male" ? 0 : 2].hex,
    eyeColor: EYE_COLORS[4].hex,
    top: sex === "male" ? "hoodie" : "baby_tee",
    bottom: sex === "male" ? "baggy" : "pleated_skirt",
    dress: "sundress",
    wearDress: sex === "female",
    clothColor: CLOTH_COLORS[sex === "male" ? 4 : 0].hex,
    accentColor: CLOTH_COLORS[9].hex,
    accessory: sex === "female" ? "bow" : "none",
  };
}

window.LoveseatStyles = {
  SKINS,
  HAIR_COLORS,
  EYE_COLORS,
  CLOTH_COLORS,
  HAIR,
  TOPS,
  BOTTOMS,
  DRESSES,
  ACCESSORIES,
  hairForSex,
  bottomsForSex,
  defaultAppearance,
};

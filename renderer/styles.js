const SKINS = ["#f9e0c8", "#f3c7a8", "#e0a07a", "#c68642", "#8d5524"];

const HAIR_COLORS = [
  { id: "jet_black", name: "Jet Black", hex: "#1a1a1a" },
  { id: "dark_brown", name: "Dark Brown", hex: "#3b2414" },
  { id: "chestnut", name: "Chestnut", hex: "#6b3a1f" },
  { id: "auburn", name: "Auburn", hex: "#922b21" },
  { id: "ginger", name: "Ginger", hex: "#c45c26" },
  { id: "platinum", name: "Platinum Blonde", hex: "#e8dcc8" },
  { id: "ash_blonde", name: "Ash Blonde", hex: "#c4b59a" },
  { id: "white", name: "White", hex: "#f4f1ea" },
  { id: "pastel_pink", name: "Pastel Pink", hex: "#ffb6c1" },
  { id: "lavender", name: "Lavender", hex: "#c3a2e2" },
];

const EYE_COLORS = [
  { id: "black", name: "Black", hex: "#1a1a1a" },
  { id: "dark_brown", name: "Dark Brown", hex: "#3d2314" },
  { id: "light_brown", name: "Light Brown", hex: "#8b5a2b" },
  { id: "hazel", name: "Hazel", hex: "#8a6d3b" },
  { id: "amber", name: "Amber", hex: "#c47a2c" },
  { id: "green", name: "Green", hex: "#4a7c4e" },
  { id: "emerald", name: "Emerald", hex: "#1f7a4d" },
  { id: "sky_blue", name: "Sky Blue", hex: "#89cff0" },
  { id: "deep_blue", name: "Deep Blue", hex: "#2c4a7c" },
  { id: "gray", name: "Gray", hex: "#7a7a7a" },
];

const CLOTH_COLORS = [
  { name: "Cherry Blossom", hex: "#FFB6C1" },
  { name: "Cotton Candy", hex: "#FF9AA2" },
  { name: "Blush Petal", hex: "#EFA6AA" },
  { name: "Strawberry Mousse", hex: "#FFA69E" },
  { name: "Sky Breeze", hex: "#A7D8F0" },
  { name: "Baby Blue", hex: "#89CFF0" },
  { name: "Minty Splash", hex: "#77DDDD" },
  { name: "Seafoam Whisper", hex: "#72E0D5" },
  { name: "Lemon Grass", hex: "#C5E1A5" },
  { name: "Pastel Lime", hex: "#D4E157" },
  { name: "Buttercream", hex: "#F3E5AB" },
  { name: "Soft Gold", hex: "#F8DE7E" },
  { name: "Peach Parfait", hex: "#FFD3A5" },
  { name: "Apricot Sorbet", hex: "#F7C59F" },
  { name: "Sunset Glow", hex: "#F4A582" },
  { name: "Warm Taffy", hex: "#FFB347" },
  { name: "Soft Lavender", hex: "#D8BFD8" },
  { name: "Lilac Frost", hex: "#E6A8D7" },
  { name: "Amethyst Mist", hex: "#C3A2E2" },
  { name: "Mauve Glow", hex: "#D1B3C4" },
  { name: "Antique Ivory", hex: "#EAE0C8" },
  { name: "Powdered Ash", hex: "#CFCFCF" },
  { name: "Sandstone Haze", hex: "#DED7B7" },
  { name: "Moonlit Fog", hex: "#B5B5B5" },
];

const HAIR = [
  { id: "long_straight", name: "Long Straight", tags: ["feminine"], draw: "long" },
  { id: "long_wavy", name: "Long Wavy", tags: ["feminine"], draw: "wavy" },
  { id: "wolf_cut", name: "Wolf Cut", tags: ["feminine", "masculine", "unisex"], draw: "wolf" },
  { id: "layered_shag", name: "Layered Shag", tags: ["feminine"], draw: "shag" },
  { id: "bob_cut", name: "Bob Cut", tags: ["feminine"], draw: "bob" },
  { id: "hime_cut", name: "Hime Cut", tags: ["feminine"], draw: "hime" },
  { id: "pixie_cut", name: "Pixie Cut", tags: ["feminine"], draw: "pixie" },
  { id: "twin_tails", name: "Twin Tails", tags: ["feminine"], draw: "twins" },
  { id: "high_ponytail", name: "High Ponytail", tags: ["feminine"], draw: "pony" },
  { id: "messy_bun", name: "Messy Bun", tags: ["feminine"], draw: "bun" },
  { id: "buzz_cut", name: "Buzz Cut", tags: ["masculine"], draw: "buzz" },
  { id: "crew_cut", name: "Crew Cut", tags: ["masculine"], draw: "crew" },
  { id: "french_crop", name: "French Crop", tags: ["masculine"], draw: "crop" },
  { id: "two_block", name: "Two Block", tags: ["masculine"], draw: "block" },
  { id: "comma_hair", name: "Comma Hair", tags: ["masculine"], draw: "comma" },
  { id: "middle_part", name: "Middle Part", tags: ["masculine"], draw: "part" },
  { id: "messy_fringe", name: "Messy Fringe", tags: ["masculine"], draw: "fringe" },
  { id: "mullet", name: "Mullet", tags: ["masculine", "unisex"], draw: "mullet" },
  { id: "man_bun", name: "Man Bun", tags: ["masculine"], draw: "manbun" },
  { id: "shag", name: "Shag", tags: ["unisex"], draw: "shag" },
  { id: "shoulder_length", name: "Shoulder Length", tags: ["unisex"], draw: "shoulder" },
  { id: "curly", name: "Curly", tags: ["unisex"], draw: "curly" },
  { id: "messy_medium", name: "Messy Medium", tags: ["unisex"], draw: "shag" },
  { id: "long_layered", name: "Long Layered", tags: ["unisex"], draw: "long" },
  { id: "half_up", name: "Half Up", tags: ["unisex"], draw: "half" },
  { id: "ponytail", name: "Ponytail", tags: ["unisex"], draw: "lowpony" },
  { id: "braided", name: "Braided", tags: ["unisex"], draw: "braid" },
];

const TOPS = [
  { id: "tshirt", name: "T-Shirt", sil: "fit" },
  { id: "oversized", name: "Oversized T-Shirt", sil: "over" },
  { id: "baby_tee", name: "Baby Tee", sil: "crop" },
  { id: "tank", name: "Tank Top", sil: "tank" },
  { id: "button_up", name: "Button-Up Shirt", sil: "fit" },
  { id: "blouse", name: "Blouse", sil: "fit" },
  { id: "sweater", name: "Sweater", sil: "over" },
  { id: "hoodie", name: "Hoodie", sil: "hoodie" },
  { id: "cardigan", name: "Cardigan", sil: "over" },
  { id: "turtleneck", name: "Turtleneck", sil: "turtle" },
];

const BOTTOMS = [
  { id: "skinny", name: "Skinny Jeans", sil: "pants" },
  { id: "straight", name: "Straight Jeans", sil: "pants" },
  { id: "baggy", name: "Baggy Jeans", sil: "baggy" },
  { id: "wide", name: "Wide-Leg Trousers", sil: "baggy" },
  { id: "cargo", name: "Cargo Pants", sil: "baggy" },
  { id: "sweats", name: "Sweatpants", sil: "pants" },
  { id: "denim_shorts", name: "Denim Shorts", sil: "shorts" },
  { id: "pleated_shorts", name: "Pleated Shorts", sil: "shorts" },
  { id: "mini_skirt", name: "Mini Skirt", sil: "skirt" },
  { id: "pleated_skirt", name: "Pleated Skirt", sil: "skirt" },
];

const DRESSES = [
  { id: "sundress", name: "Sundress", sil: "short" },
  { id: "mini_dress", name: "Mini Dress", sil: "short" },
  { id: "slip", name: "Slip Dress", sil: "midi" },
  { id: "babydoll", name: "Babydoll Dress", sil: "short" },
  { id: "maxi", name: "Maxi Dress", sil: "long" },
  { id: "sweater_dress", name: "Sweater Dress", sil: "midi" },
  { id: "shirt_dress", name: "Shirt Dress", sil: "midi" },
  { id: "pinafore", name: "Pinafore Dress", sil: "short" },
  { id: "cottagecore", name: "Cottagecore Dress", sil: "long" },
  { id: "gothic", name: "Gothic Dress", sil: "long" },
];

const LOVE_EMOTES = ["♥", "💕", "💖", "💗", "💓", "💞", "💘", "💝", "😍", "🥰", "🌸", "💌"];

const FURNITURE = [
  { id: 0, name: "sofa L", x: 92, y: 172 },
  { id: 1, name: "sofa R", x: 152, y: 172 },
  { id: 2, name: "loveseat", x: 248, y: 164 },
  { id: 3, name: "armchair", x: 360, y: 170 },
  { id: 4, name: "cushion", x: 300, y: 198 },
  { id: 5, name: "nook", x: 430, y: 150 },
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
    hairColor: HAIR_COLORS[sex === "male" ? 0 : 8].hex,
    eyeColor: EYE_COLORS[7].hex,
    top: sex === "male" ? "hoodie" : "baby_tee",
    bottom: sex === "male" ? "baggy" : "pleated_skirt",
    dress: sex === "female" ? "sundress" : "",
    wearDress: sex === "female",
    clothColor: CLOTH_COLORS[sex === "male" ? 4 : 0].hex,
    accentColor: CLOTH_COLORS[10].hex,
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
  LOVE_EMOTES,
  FURNITURE,
  hairForSex,
  bottomsForSex,
  defaultAppearance,
};

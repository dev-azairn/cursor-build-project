const SKINS = ["#f3c7a8", "#e0a07a", "#c68642", "#8d5524", "#f9e0c8"];
const HAIR_COLORS = ["#2b1b16", "#6b3a1f", "#d4a017", "#f24e7c", "#3d5a80", "#f8f0c8"];
const SHIRTS = ["#ff7aa2", "#8ee3c3", "#7aa2ff", "#f4d35e", "#c45c7a", "#ffffff"];
const ACCENTS = ["#ff7aa2", "#f4d35e", "#8ee3c3", "#ffffff", "#7aa2ff"];
const HAIR_STYLES = ["bob", "spikes", "long", "bun"];

function px(ctx, x, y, color, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawCharacter(canvas, appearance = {}, sitting = true) {
  const ctx = canvas.getContext("2d");
  const scale = 4;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.scale(scale, scale);

  const skin = appearance.skin || SKINS[0];
  const hair = appearance.hairColor || HAIR_COLORS[0];
  const shirt = appearance.shirt || SHIRTS[0];
  const accent = appearance.accent || ACCENTS[0];
  const style = appearance.hair || "bob";
  const outline = "#1b1024";

  const ox = 4;
  const oy = sitting ? 3 : 1;

  px(ctx, ox + 2, oy + 2, outline, 8, 8);
  px(ctx, ox + 3, oy + 3, skin, 6, 6);
  px(ctx, ox + 4, oy + 5, outline, 1, 1);
  px(ctx, ox + 7, oy + 5, outline, 1, 1);
  px(ctx, ox + 5, oy + 7, "#c45c7a", 2, 1);

  if (style === "bob") {
    px(ctx, ox + 1, oy + 1, outline, 10, 4);
    px(ctx, ox + 2, oy + 2, hair, 8, 3);
    px(ctx, ox + 1, oy + 4, hair, 2, 4);
    px(ctx, ox + 9, oy + 4, hair, 2, 4);
  } else if (style === "spikes") {
    px(ctx, ox + 3, oy + 0, outline, 2, 2);
    px(ctx, ox + 6, oy + 0, outline, 2, 2);
    px(ctx, ox + 2, oy + 1, hair, 8, 3);
    px(ctx, ox + 3, oy + 0, hair, 2, 2);
    px(ctx, ox + 6, oy + 0, hair, 2, 2);
  } else if (style === "long") {
    px(ctx, ox + 1, oy + 1, outline, 10, 3);
    px(ctx, ox + 2, oy + 2, hair, 8, 2);
    px(ctx, ox + 1, oy + 4, hair, 2, 8);
    px(ctx, ox + 9, oy + 4, hair, 2, 8);
  } else {
    px(ctx, ox + 4, oy + 0, outline, 4, 3);
    px(ctx, ox + 5, oy + 0, hair, 2, 2);
    px(ctx, ox + 2, oy + 2, hair, 8, 3);
    px(ctx, ox + 9, oy + 4, accent, 2, 2);
  }

  px(ctx, ox + 2, oy + 10, outline, 8, 7);
  px(ctx, ox + 3, oy + 10, shirt, 6, 6);
  px(ctx, ox + 5, oy + 11, accent, 2, 2);

  if (sitting) {
    px(ctx, ox + 1, oy + 15, outline, 4, 3);
    px(ctx, ox + 7, oy + 15, outline, 4, 3);
    px(ctx, ox + 2, oy + 15, skin, 2, 2);
    px(ctx, ox + 8, oy + 15, skin, 2, 2);
  } else {
    px(ctx, ox + 3, oy + 16, outline, 3, 3);
    px(ctx, ox + 7, oy + 16, outline, 3, 3);
    px(ctx, ox + 4, oy + 16, skin, 1, 2);
    px(ctx, ox + 8, oy + 16, skin, 1, 2);
  }

  ctx.restore();
}

window.LoveseatArt = {
  SKINS,
  HAIR_COLORS,
  SHIRTS,
  ACCENTS,
  HAIR_STYLES,
  drawCharacter,
};

const S = window.LoveseatStyles;
const SKINS = S.SKINS;
const OUTLINE = "#3d3a45";

function px(ctx, x, y, color, w = 1, h = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function shade(hex, amt) {
  const n = hex.replace("#", "");
  const r = Math.max(0, Math.min(255, parseInt(n.slice(0, 2), 16) + amt));
  const g = Math.max(0, Math.min(255, parseInt(n.slice(2, 4), 16) + amt));
  const b = Math.max(0, Math.min(255, parseInt(n.slice(4, 6), 16) + amt));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function hairMeta(id) {
  return S.HAIR.find((h) => h.id === id) || S.HAIR[4];
}

function drawHair(ctx, ox, oy, style, color, sitting) {
  const draw = hairMeta(style).draw;
  const dark = shade(color, -28);
  const bangs = () => {
    px(ctx, ox + 3, oy + 3, color, 10, 2);
    px(ctx, ox + 4, oy + 4, color, 3, 2);
    px(ctx, ox + 9, oy + 4, color, 3, 2);
  };

  px(ctx, ox + 3, oy + 1, dark, 10, 3);
  px(ctx, ox + 4, oy + 1, color, 8, 3);

  if (draw === "buzz" || draw === "crew") {
    px(ctx, ox + 4, oy + 2, color, 8, 2);
    return;
  }
  if (draw === "pixie" || draw === "crop") {
    bangs();
    px(ctx, ox + 3, oy + 4, color, 2, 2);
    px(ctx, ox + 11, oy + 4, color, 2, 2);
    return;
  }
  if (draw === "bob" || draw === "hime") {
    bangs();
    px(ctx, ox + 2, oy + 4, color, 2, 6);
    px(ctx, ox + 12, oy + 4, color, 2, 6);
    if (draw === "hime") px(ctx, ox + 5, oy + 4, color, 6, 1);
    return;
  }
  if (draw === "twins") {
    bangs();
    px(ctx, ox + 1, oy + 5, color, 3, 6);
    px(ctx, ox + 12, oy + 5, color, 3, 6);
    px(ctx, ox + 1, oy + 11, S.CLOTH_COLORS[0].hex, 3, 2);
    px(ctx, ox + 12, oy + 11, S.CLOTH_COLORS[0].hex, 3, 2);
    return;
  }
  if (draw === "pony" || draw === "lowpony" || draw === "half") {
    bangs();
    px(ctx, ox + 11, oy + 1, color, 3, 8);
    px(ctx, ox + 12, oy + 8, color, 2, 4);
    return;
  }
  if (draw === "bun" || draw === "manbun") {
    px(ctx, ox + 6, oy + 0, color, 4, 3);
    px(ctx, ox + 5, oy + 1, dark, 6, 2);
    bangs();
    return;
  }
  if (draw === "wolf" || draw === "mullet" || draw === "shag" || draw === "fringe") {
    bangs();
    px(ctx, ox + 2, oy + 5, color, 2, sitting ? 5 : 7);
    px(ctx, ox + 12, oy + 5, color, 2, sitting ? 5 : 7);
    px(ctx, ox + 4, oy + 9, color, 2, 3);
    px(ctx, ox + 10, oy + 9, color, 2, 3);
    return;
  }
  if (draw === "comma" || draw === "part" || draw === "block") {
    px(ctx, ox + 4, oy + 2, color, 4, 3);
    px(ctx, ox + 8, oy + 3, color, 4, 2);
    return;
  }
  if (draw === "curly") {
    px(ctx, ox + 2, oy + 2, color, 3, 3);
    px(ctx, ox + 11, oy + 2, color, 3, 3);
    px(ctx, ox + 5, oy + 1, color, 6, 2);
    bangs();
    return;
  }
  if (draw === "braid") {
    bangs();
    px(ctx, ox + 12, oy + 5, color, 2, 8);
    px(ctx, ox + 12, oy + 7, dark, 2, 1);
    px(ctx, ox + 12, oy + 10, dark, 2, 1);
    return;
  }
  bangs();
  px(ctx, ox + 2, oy + 5, color, 2, sitting ? 7 : 10);
  px(ctx, ox + 12, oy + 5, color, 2, sitting ? 7 : 10);
  if (draw === "wavy") {
    px(ctx, ox + 1, oy + 8, color, 2, 2);
    px(ctx, ox + 13, oy + 10, color, 2, 2);
  }
}

function drawEyes(ctx, ox, oy, color, blink) {
  if (blink) {
    px(ctx, ox + 5, oy + 7, OUTLINE, 2, 1);
    px(ctx, ox + 9, oy + 7, OUTLINE, 2, 1);
    return;
  }
  px(ctx, ox + 5, oy + 6, "#fff", 3, 3);
  px(ctx, ox + 9, oy + 6, "#fff", 3, 3);
  px(ctx, ox + 6, oy + 7, color, 2, 2);
  px(ctx, ox + 10, oy + 7, color, 2, 2);
  px(ctx, ox + 7, oy + 7, "#fff", 1, 1);
  px(ctx, ox + 11, oy + 7, "#fff", 1, 1);
}

function drawTop(ctx, ox, y, sil, color, accent) {
  const dark = shade(color, -22);
  px(ctx, ox + 4, y, OUTLINE, 8, 7);
  if (sil === "tank") {
    px(ctx, ox + 5, y, color, 6, 6);
  } else if (sil === "hoodie") {
    px(ctx, ox + 3, y - 1, dark, 10, 2);
    px(ctx, ox + 4, y, color, 8, 6);
    px(ctx, ox + 7, y + 2, accent, 2, 3);
  } else if (sil === "turtle") {
    px(ctx, ox + 6, y - 1, color, 4, 2);
    px(ctx, ox + 4, y, color, 8, 6);
  } else if (sil === "over") {
    px(ctx, ox + 3, y, color, 10, 6);
  } else if (sil === "crop") {
    px(ctx, ox + 4, y, color, 8, 4);
    px(ctx, ox + 5, y + 4, shade(color, 18), 6, 2);
  } else {
    px(ctx, ox + 4, y, color, 8, 6);
    px(ctx, ox + 7, y + 1, accent, 2, 2);
  }
}

function drawBottom(ctx, ox, y, sil, color, sitting, walkLeg) {
  const dark = shade(color, -18);
  if (sitting) {
    px(ctx, ox + 3, y, OUTLINE, 5, 4);
    px(ctx, ox + 8, y, OUTLINE, 5, 4);
    px(ctx, ox + 4, y, color, 3, 3);
    px(ctx, ox + 9, y, color, 3, 3);
    return;
  }
  const left = ox + 5 + (walkLeg ? 1 : 0);
  const right = ox + 9 - (walkLeg ? 1 : 0);
  if (sil === "skirt") {
    px(ctx, ox + 3, y, OUTLINE, 10, 4);
    px(ctx, ox + 4, y, color, 8, 3);
    px(ctx, left, y + 3, dark, 2, 4);
    px(ctx, right, y + 3, dark, 2, 4);
    return;
  }
  if (sil === "shorts") {
    px(ctx, ox + 5, y, color, 6, 3);
    px(ctx, left, y + 3, dark, 2, 4);
    px(ctx, right, y + 3, dark, 2, 4);
    return;
  }
  const w = sil === "baggy" ? 3 : 2;
  px(ctx, left, y, OUTLINE, w + 1, 7);
  px(ctx, right, y, OUTLINE, w + 1, 7);
  px(ctx, left, y, color, w, 6);
  px(ctx, right, y, color, w, 6);
}

function drawDress(ctx, ox, y, sil, color, sitting, walkLeg) {
  const dark = shade(color, -18);
  px(ctx, ox + 4, y, OUTLINE, 8, 3);
  px(ctx, ox + 4, y, color, 8, 6);
  if (sil === "long" || sil === "midi") {
    px(ctx, ox + 3, y + 5, color, 10, sitting ? 4 : 7);
  } else {
    px(ctx, ox + 3, y + 5, color, 10, 4);
  }
  if (!sitting) {
    px(ctx, ox + 5 + (walkLeg ? 1 : 0), y + 8, dark, 2, 4);
    px(ctx, ox + 9 - (walkLeg ? 1 : 0), y + 8, dark, 2, 4);
  }
}

function drawArms(ctx, ox, y, skin, color, frame, sitting) {
  const swing = sitting ? 0 : (frame % 2 === 0 ? 0 : 1);
  px(ctx, ox + 2, y + swing, OUTLINE, 2, 6);
  px(ctx, ox + 12, y - swing, OUTLINE, 2, 6);
  px(ctx, ox + 2, y + swing, color, 2, 2);
  px(ctx, ox + 12, y - swing, color, 2, 2);
  px(ctx, ox + 2, y + 2 + swing, skin, 2, 3);
  px(ctx, ox + 12, y + 2 - swing, skin, 2, 3);
}

function appearanceOf(raw = {}) {
  const sex = raw.sex === "male" ? "male" : "female";
  const base = S.defaultAppearance(sex);
  return { ...base, ...raw, sex };
}

function drawCharacter(canvas, appearance = {}, options = {}) {
  const app = appearanceOf(appearance);
  const pose = options.pose || (options.sitting === false ? "stand" : "sit");
  const sitting = pose === "sit";
  const frame = options.frame || 0;
  const facing = options.facing === "left" ? -1 : 1;
  const ctx = canvas.getContext("2d");
  const scale = options.scale || 4;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.scale(scale, scale);
  const w = canvas.width / scale;
  ctx.translate(facing === -1 ? w : 0, 0);
  ctx.scale(facing, 1);

  const bob = sitting ? [0, 1, 0, 0][frame % 4] : [0, 1, 0, 1][frame % 4];
  const blink = frame % 8 === 3;
  const walkLeg = pose === "walk" && frame % 2 === 1;
  const ox = 2;
  const oy = (sitting ? 3 : 1) + bob;

  px(ctx, ox + 4, oy + 3, OUTLINE, 8, 8);
  px(ctx, ox + 5, oy + 4, app.skin, 6, 6);
  drawEyes(ctx, ox, oy, app.eyeColor, blink);
  px(ctx, ox + 7, oy + 10, "#e89aa8", 2, 1);

  const top = S.TOPS.find((t) => t.id === app.top) || S.TOPS[0];
  const bottom = S.BOTTOMS.find((b) => b.id === app.bottom) || S.BOTTOMS[0];
  const dress = S.DRESSES.find((d) => d.id === app.dress) || S.DRESSES[0];
  const bodyY = oy + 11;
  const useDress = app.sex === "female" && app.wearDress && app.dress;

  drawArms(ctx, ox, bodyY, app.skin, app.clothColor, frame, sitting);
  if (useDress) drawDress(ctx, ox, bodyY, dress.sil, app.clothColor, sitting, walkLeg);
  else {
    drawTop(ctx, ox, bodyY, top.sil, app.clothColor, app.accentColor);
    drawBottom(ctx, ox, bodyY + 6, bottom.sil, app.accentColor, sitting, walkLeg);
  }

  drawHair(ctx, ox, oy, app.hair, app.hairColor, sitting);
  ctx.restore();
}

function drawClothIcon(canvas, kind, id, color) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.scale(3, 3);
  const ox = 2;
  if (kind === "top") {
    const sil = (S.TOPS.find((t) => t.id === id) || S.TOPS[0]).sil;
    drawTop(ctx, ox, 3, sil, color, shade(color, 30));
  } else if (kind === "bottom") {
    const sil = (S.BOTTOMS.find((b) => b.id === id) || S.BOTTOMS[0]).sil;
    drawBottom(ctx, ox, 4, sil, color, false, false);
  } else {
    const sil = (S.DRESSES.find((d) => d.id === id) || S.DRESSES[0]).sil;
    drawDress(ctx, ox, 2, sil, color, false, false);
  }
  ctx.restore();
}

window.LoveseatArt = {
  SKINS,
  drawCharacter,
  drawClothIcon,
  appearanceOf,
};

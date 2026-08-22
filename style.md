# Pixel Couple Character Style System

Build a character customization/style system for a pixel-art couples/lovers widget.

The characters live together in a room and users can interact with them. The visual style should feel cute, cozy, expressive, and suitable for small pixel-art sprites.

Create reusable style categories. Do **not** hard-code styles specifically to gender unless necessary. Use `feminine`, `masculine`, and `unisex` tags where appropriate so users can mix styles freely.

---

## 1. Hair Styles

### Feminine

1. Long Straight
2. Long Wavy
3. Wolf Cut
4. Layered Shag
5. Bob Cut
6. Hime Cut
7. Pixie Cut
8. Twin Tails
9. High Ponytail
10. Messy Bun

### Masculine

1. Buzz Cut
2. Crew Cut
3. French Crop
4. Two Block
5. Comma Hair
6. Middle Part
7. Messy Fringe
8. Wolf Cut
9. Mullet
10. Man Bun

### Unisex

1. Shag
2. Wolf Cut
3. Mullet
4. Shoulder Length
5. Curly
6. Messy Medium
7. Long Layered
8. Half Up
9. Ponytail
10. Braided

---

## 2. Hair Colors

Provide these 10 base hair colors:

1. Jet Black
2. Dark Brown
3. Chestnut
4. Auburn
5. Ginger
6. Platinum Blonde
7. Ash Blonde
8. White
9. Pastel Pink
10. Lavender

Also allow future support for:

- Blue
- Cyan
- Mint
- Green
- Red
- Burgundy
- Purple
- Orange
- Two-tone
- Split Dye
- Ombre
- Colored Tips

---

## 3. Eye Colors

Provide these 10 base eye colors:

1. Black
2. Dark Brown
3. Light Brown
4. Hazel
5. Amber
6. Green
7. Emerald
8. Sky Blue
9. Deep Blue
10. Gray

Allow optional fantasy colors later:

- Lavender
- Purple
- Pink
- Ruby Red
- Gold
- Cyan
- Teal
- White

---

## 4. Clothing Aesthetics

Create selectable fashion-style presets:

1. Casual
2. Streetwear
3. Y2K
4. Coquette
5. Cottagecore
6. Grunge
7. Goth
8. Soft Goth
9. Preppy
10. Dark Academia

Each aesthetic should influence clothing combinations but should **not** lock the character's gender.

---

## 5. Tops

Create these top types:

1. T-Shirt
2. Oversized T-Shirt
3. Baby Tee
4. Tank Top
5. Button-Up Shirt
6. Blouse
7. Sweater
8. Hoodie
9. Cardigan
10. Turtleneck

---

## 6. Bottoms

Create these bottom types:

1. Skinny Jeans
2. Straight Jeans
3. Baggy Jeans
4. Wide-Leg Trousers
5. Cargo Pants
6. Sweatpants
7. Denim Shorts
8. Pleated Shorts
9. Mini Skirt
10. Pleated Skirt

---

## 7. Dresses

Create these dress types:

1. Sundress
2. Mini Dress
3. Slip Dress
4. Babydoll Dress
5. Maxi Dress
6. Sweater Dress
7. Shirt Dress
8. Pinafore Dress
9. Cottagecore Dress
10. Gothic Dress

---

## 8. Outerwear

Create these options:

1. Denim Jacket
2. Leather Jacket
3. Bomber Jacket
4. Varsity Jacket
5. Blazer
6. Trench Coat
7. Long Coat
8. Puffer Jacket
9. Cropped Jacket
10. Oversized Cardigan

---

## 9. Shoes

Create these options:

1. Sneakers
2. High-Top Sneakers
3. Platform Sneakers
4. Loafers
5. Mary Janes
6. Ballet Flats
7. Ankle Boots
8. Combat Boots
9. Platform Boots
10. Sandals

---

## 10. Accessories

Create these options:

1. Glasses
2. Sunglasses
3. Hair Clip
4. Hair Ribbon
5. Headband
6. Beanie
7. Baseball Cap
8. Choker
9. Necklace
10. Earrings

---

## 11. Special Eye Features

Make these optional modifiers:

1. Normal
2. Sparkle Eyes
3. Gradient Iris
4. Ringed Iris
5. Cat Pupils
6. Star Pupils
7. Heart Pupils
8. Glowing Eyes
9. Heterochromia
10. Two-Tone Iris

---

## 12. Character Style Presets

Create preset combinations that can be randomly generated or selected by users.

Examples:

- Soft Girl
- Streetwear Boy
- Y2K Girl
- Y2K Boy
- Cozy Couple
- Cottagecore Couple
- Goth Couple
- Academic Couple
- Grunge Couple
- Casual Couple

Each preset should define compatible:

- Hair style
- Hair color
- Eye color
- Clothing aesthetic
- Top
- Bottom/dress
- Shoes
- Accessories

---

# Technical Requirements

Represent these options as structured data so they are easy to expand later.

Prefer a structure similar to:

```js
{
  id: "wolf_cut",
  name: "Wolf Cut",
  category: "hair",
  tags: ["unisex", "alternative", "trendy"]
}
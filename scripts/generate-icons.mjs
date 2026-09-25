// Renders the logo SVGs in src/assets/logo into every icon the app needs.
// Run with `npm run icons` after editing an SVG, then commit the results.
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const root = resolve(import.meta.dirname, "..");
const logo = (name) => resolve(root, "src/assets/logo", name);

// density scales the SVG's rasterization so edges stay crisp at any size.
async function render(svgPath, size) {
  const svg = await readFile(svgPath);
  return sharp(svg, { density: (72 * size) / 96 })
    .resize(size, size)
    .png()
    .toBuffer();
}

async function write(path, buffer) {
  await writeFile(resolve(root, path), buffer);
  console.log("wrote", path);
}

await mkdir(resolve(root, "public/icons"), { recursive: true });

// PWA icons referenced by src/app/manifest.ts
await write("public/icons/icon-192.png", await render(logo("mark.svg"), 192));
await write("public/icons/icon-512.png", await render(logo("mark.svg"), 512));
await write(
  "public/icons/icon-maskable-512.png",
  await render(logo("mark-maskable.svg"), 512),
);

// iOS applies its own rounded mask, so it gets the full-bleed square.
await write(
  "src/app/apple-icon.png",
  await render(logo("mark-maskable.svg"), 180),
);

// Favicons use the simplified mark: fewer details survive at 16px.
await copyFile(logo("mark-small.svg"), resolve(root, "src/app/icon.svg"));
console.log("wrote src/app/icon.svg");
const faviconSizes = await Promise.all(
  [16, 32, 48].map((size) => render(logo("mark-small.svg"), size)),
);
await write("src/app/favicon.ico", await pngToIco(faviconSizes));

// iOS splash screens (apple-touch-startup-image), portrait, light and dark.
// Device list is shared with src/app/layout.tsx; colors come from theme-colors.ts.
const devices = JSON.parse(
  await readFile(resolve(root, "src/assets/splash-devices.json"), "utf8"),
);
const themeSource = await readFile(
  resolve(root, "src/app/theme-colors.ts"),
  "utf8",
);
const splashColors = {
  light: themeSource.match(/light:\s*"(#[0-9a-fA-F]{6})"/)[1],
  dark: themeSource.match(/dark:\s*"(#[0-9a-fA-F]{6})"/)[1],
};

await mkdir(resolve(root, "public/splash"), { recursive: true });
for (const { width, height, ratio } of devices) {
  const w = width * ratio;
  const h = height * ratio;
  // The mark is a quarter of the screen width, centered.
  const markSize = Math.round(w / 4);
  const mark = await render(logo("mark.svg"), markSize);

  for (const [theme, background] of Object.entries(splashColors)) {
    const png = await sharp({
      create: { width: w, height: h, channels: 3, background },
    })
      .composite([
        {
          input: mark,
          left: Math.round((w - markSize) / 2),
          top: Math.round((h - markSize) / 2),
        },
      ])
      .png()
      .toBuffer();
    await write(`public/splash/${theme}-${w}x${h}.png`, png);
  }
}

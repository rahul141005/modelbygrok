import fs from "fs";
import path from "path";

const ICONS = {
  body: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="4.5" r="2.5"/>
  <path d="M7 11.5c0-1.5 2-2.5 5-2.5s5 1 5 2.5v4.5c0 1-.5 2-1.5 2.5L14 22h-4l-1.5-3.5c-1-.5-1.5-1.5-1.5-2.5v-4.5z"/>
</svg>`,

  face: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2C7.5 2 4 5.8 4 10.5c0 5 3.5 9 8 11.5 4.5-2.5 8-6.5 8-11.5C20 5.8 16.5 2 12 2z"/>
  <path d="M8.5 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
  <path d="M10 15c.6.8 1.3 1 2 1s1.4-.2 2-1"/>
</svg>`,

  hair: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 3c-5 0-8 3.5-8 8 0 3 .8 6 2 9.5 1.5-3 2-6 2-7.5 0-3 1.8-5 4-5s4 2 4 5c0 1.5.5 4.5 2 7.5 1.2-3.5 2-6.5 2-9.5 0-4.5-3-8-8-8z"/>
</svg>`,

  clothes: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 3l4 3 4-3 5 4-2.5 4L16 6.5V21H8V6.5L5.5 8 3 4l5-3z"/>
</svg>`,

  accessories: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="14" r="6"/>
  <path d="M9.5 8.5L12 4l2.5 4.5"/>
  <circle cx="12" cy="4" r="1.5" fill="currentColor"/>
</svg>`,

  makeup: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M8 11h8v10H8z"/>
  <path d="M10 11V6a2 2 0 0 1 4 0v5"/>
  <path d="M10 6l3.5-3.5a.7.7 0 0 1 1 0l.5.5a.7.7 0 0 1 0 1L12 7"/>
</svg>`,

  pose: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="3.5" r="2"/>
  <path d="M7 8.5l5 2 5-2M12 10.5v6l-3 4.5M12 16.5l3 4.5"/>
</svg>`,

  camera: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
  <circle cx="12" cy="13" r="4"/>
</svg>`,

  lighting: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <circle cx="12" cy="12" r="5"/>
  <line x1="12" y1="1" x2="12" y2="3"/>
  <line x1="12" y1="21" x2="12" y2="23"/>
  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
  <line x1="1" y1="12" x2="3" y2="12"/>
  <line x1="21" y1="12" x2="23" y2="12"/>
  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
</svg>`,

  presets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
</svg>`,

  randomize: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <polyline points="23 4 23 10 17 10"/>
  <polyline points="1 20 1 14 7 14"/>
  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
</svg>`,

  save: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
  <polyline points="17 21 17 13 7 13 7 21"/>
  <polyline points="7 3 7 8 15 8"/>
</svg>`
};

const targetDir = path.resolve("public/assets/ui/icons");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

for (const [name, svg] of Object.entries(ICONS)) {
  fs.writeFileSync(path.join(targetDir, `${name}.svg`), svg.trim());
}

console.log(`Generated ${Object.keys(ICONS).length} SVG UI icons in ${targetDir}`);

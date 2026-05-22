import satori from "satori";
import sharp from "sharp";
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const WIDTH = 1200;
const HEIGHT = 630;

const FONT_400 = resolve(
  import.meta.dirname,
  "../node_modules/@fontsource/inter/files/inter-latin-400-normal.woff"
);
const FONT_700 = resolve(
  import.meta.dirname,
  "../node_modules/@fontsource/inter/files/inter-latin-700-normal.woff"
);

// Inline SVG favicon using plain JSX for Satori
function FaviconIcon() {
  return {
    type: "svg",
    props: {
      viewBox: "0 0 260 263",
      width: 100,
      height: 100,
      children: {
        type: "path",
        props: {
          d: "M4423.627 604.006a10.002 10.002 0 0 0 15-8.66v-37.018c0-11.046 8.954-20 20-20h34.338c11.046 0 20 8.954 20 20v34.338c0 11.046-8.954 20-20 20h-39.41a4.001 4.001 0 0 0-2 7.464l51.41 29.682a20 20 0 0 1 10 17.321v82.569a20 20 0 0 1-30 17.321l-29.338-16.939a30 30 0 0 0-30 0l-49.339 28.486a20 20 0 0 1-20 0l-71.507-41.285a20 20 0 0 1 0-34.641l29.338-16.939a9.999 9.999 0 0 0 0-17.32l-29.338-16.939a19.999 19.999 0 0 1 0-34.641l71.507-41.284a20 20 0 0 1 20 0zm-81.508 64.379a10 10 0 0 0 0 17.32l81.508 47.059a10.002 10.002 0 0 0 15-8.66v-94.117a9.999 9.999 0 0 0-15-8.66z",
          fill: "#9666e3",
          transform: "translate(-4625.294 -582.741) scale(1.0825)",
        },
      },
    },
  };
}

async function main() {
  const [font400, font700] = [
    readFileSync(FONT_400),
    readFileSync(FONT_700),
  ];

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0d0d12",
        },
        children: [
          FaviconIcon(),
          {
            type: "div",
            props: {
              style: {
                fontSize: 80,
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                fontFamily: "Inter",
                marginTop: 30,
              },
              children: "Dengerin",
            },
          },
          {
            type: "div",
            props: {
              style: {
                fontSize: 28,
                color: "#a1a1aa",
                marginTop: 20,
                fontFamily: "Inter",
                fontWeight: 400,
              },
              children: "Google Drive Music Player",
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Inter", data: font400, weight: 400, style: "normal" },
        { name: "Inter", data: font700, weight: 700, style: "normal" },
      ],
    }
  );

  const jpg = await sharp(Buffer.from(svg))
    .resize(WIDTH, HEIGHT, { fit: "fill" })
    .jpeg({ quality: 90, progressive: true })
    .toBuffer();

  writeFileSync(resolve("public/opengraph.jpg"), jpg);
  console.log(`\u2705 Generated public/opengraph.jpg (${WIDTH}x${HEIGHT})`);
}

main().catch((err) => {
  console.error("❌ OG generation failed:", err);
  process.exit(1);
});

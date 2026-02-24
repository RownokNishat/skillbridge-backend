import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["api/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs",
  outfile: "api/index.js",
  external: [
    // Prisma needs to be external as it has native bindings
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "bcrypt",
  ],
  sourcemap: false,
  minify: false,
});

console.log("Build complete: api/index.js");

import {spawn} from "node:child_process";
import {mkdir, readFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const rendersRoot = path.join(repoRoot, "renders");
const portraitDir = path.join(rendersRoot, "portrait");
const landscapeDir = path.join(rendersRoot, "landscape");

const masterDataPath = path.join(repoRoot, "public", "master.json");
const compositionId = "WorldCupGroupTemplate";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

const renderTargets = [
  {
    directory: landscapeDir,
    format: "landscape",
    label: "landscape",
  },
  {
    directory: portraitDir,
    format: "vertical",
    label: "portrait",
  },
];

const main = async () => {
  const groupIds = await getGroupIds();

  await mkdir(landscapeDir, {recursive: true});
  await mkdir(portraitDir, {recursive: true});

  for (const groupId of groupIds) {
    for (const target of renderTargets) {
      const outputPath = path.join(target.directory, `${toFileSlug(groupId)}.mp4`);
      const props = JSON.stringify({
        groupId,
        format: target.format,
      });

      console.log(
        `\n[render] ${groupId} -> ${target.label} (${path.relative(repoRoot, outputPath)})`,
      );

      await runCommand([
        "remotion",
        "render",
        compositionId,
        outputPath,
        `--props=${props}`,
      ]);
    }
  }

  console.log("\n[render] Completed all portrait and landscape exports.");
};

const getGroupIds = async () => {
  const raw = await readFile(masterDataPath, "utf8");
  const data = JSON.parse(raw);
  return Object.keys(data.groups).sort();
};

const toFileSlug = (groupId) => {
  return groupId.replace(/_/gu, "-");
};

const runCommand = (args) => {
  return new Promise((resolve, reject) => {
    const child = spawn(npxCommand, args, {
      cwd: repoRoot,
      stdio: "inherit",
    });

    child.on("error", (error) => {
      reject(error);
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command failed with exit code ${code}: ${args.join(" ")}`));
    });
  });
};

main().catch((error) => {
  console.error("\n[render] Batch render failed.");
  console.error(error);
  process.exitCode = 1;
});

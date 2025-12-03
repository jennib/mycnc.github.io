const fs = require("fs");
const path = require("path");

const targets = ["node_modules", "dist", "out", "release", "package-lock.json", ".vite", ".turbo"];

const cleanDirectory = (dir) => {
    console.log(`Cleaning ${dir}...`);
    for (const t of targets) {
        const full = path.join(dir, t);
        if (fs.existsSync(full)) {
            try {
                if (fs.lstatSync(full).isDirectory()) {
                    fs.rmSync(full, { recursive: true, force: true });
                    console.log(`  Deleted folder: ${t}`);
                } else {
                    fs.unlinkSync(full);
                    console.log(`  Deleted file: ${t}`);
                }
            } catch (err) {
                console.error(`  Failed to delete ${t}:`, err.message);
            }
        }
    }
};

// Clean root
cleanDirectory(process.cwd());

// Clean workspaces
const workspaceDirs = ["apps", "packages"];
for (const wsDir of workspaceDirs) {
    const fullWsDir = path.join(process.cwd(), wsDir);
    if (fs.existsSync(fullWsDir) && fs.lstatSync(fullWsDir).isDirectory()) {
        const subDirs = fs.readdirSync(fullWsDir);
        for (const sub of subDirs) {
            const fullSub = path.join(fullWsDir, sub);
            if (fs.lstatSync(fullSub).isDirectory()) {
                cleanDirectory(fullSub);
            }
        }
    }
}

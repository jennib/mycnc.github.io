const fs = require("fs");
const path = require("path");

const targets = ["node_modules", "dist", "out", "release", "package-lock.json"];

for (const t of targets) {
    const full = path.join(process.cwd(), t);

    if (fs.existsSync(full)) {
        try {
            if (fs.lstatSync(full).isDirectory()) {
                fs.rmSync(full, { recursive: true, force: true });
                console.log(`Deleted folder: ${t}`);
            } else {
                fs.unlinkSync(full);
                console.log(`Deleted file: ${t}`);
            }
        } catch (err) {
            console.error(`Failed to delete ${t}:`, err.message);
        }
    }
}

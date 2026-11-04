const path = require("path");
const fs = require("fs");
const { build } = require("./lib");
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const docs = [require("./doc00"), ...require("./doc01_02"), ...require("./doc03_04"), ...require("./doc05_06"), ...require("./doc07_10")];
(async () => { for (const d of docs) await build(path.join(OUT, d.file), d); })().catch(e => { console.error(e); process.exit(1); });

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const dlF = require("../shared/dl.json");
const caF = require("../shared/ca.json");
import fs from "fs";

const dl = dlF[Object.keys(dlF)[0]];
const ca = caF[Object.keys(caF)[0]];

let dlNames = {};
let dlKeys = Object.keys(dl);
for (let i = 0; i < dlKeys.length; i++) {
  dlNames[dl[dlKeys[i]].id] = dl[dlKeys[i]].name;
}

let caNames = {};
let caKeys = Object.keys(ca);
for (let i = 0; i < caKeys.length; i++) {
  caNames[ca[caKeys[i]].id] = ca[caKeys[i]].name;
}

fs.writeFileSync("./dl_names.json", JSON.stringify(dlNames));
fs.writeFileSync("./ca_names.json", JSON.stringify(caNames));

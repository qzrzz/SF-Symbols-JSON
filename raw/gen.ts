// 把 ./chars.txt 的字符和 ./keys.txt 的按键一一对应，生成 ../src/sf-symbols.json 文件

import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
	const charsPath = path.join(__dirname, "chars.txt");
	const keysPath = path.join(__dirname, "keys.txt");
	const outPath = path.join(__dirname, "..", "src", "sf-symbols.json");

	const [charsRaw, keysRaw] = await Promise.all([
		fs.readFile(charsPath, "utf8"),
		fs.readFile(keysPath, "utf8"),
	]);

	const keys = keysRaw.split(/\r?\n/).filter((s) => s.length > 0);

	// chars.txt 是一串连续的符号（可能包含 surrogate pair），移除换行后用 Array.from 正确拆分 unicode codepoints
	const charsStr = charsRaw.replace(/\r?\n/g, "").trim();
	const chars = Array.from(charsStr);

	const count = Math.min(keys.length, chars.length);
	if (keys.length !== chars.length) {
		console.warn(
			`keys length: ${keys.length}, chars length: ${chars.length}, will map ${count} items`
		);
	}

	const map: Record<string, string> = {};
	for (let i = 0; i < count; i++) {
		map[keys[i]] = chars[i];
	}

	await fs.mkdir(path.dirname(outPath), { recursive: true });
	await fs.writeFile(outPath, JSON.stringify(map, null, 2), "utf8");
	console.log(`Wrote ${outPath} with ${count} entries`);

	// 生成 char -> key 的反向映射文件
	const outPathChars = path.join(__dirname, "..", "src", "sf-symbols-chars.json");
	const charsMap: Record<string, string> = {};
	for (let i = 0; i < count; i++) {
		const ch = chars[i];
		const k = keys[i];
		if (ch in charsMap && charsMap[ch] !== k) {
			console.warn(`Duplicate char mapping for ${ch}: ${charsMap[ch]} -> ${k}`);
		}
		charsMap[ch] = k;
	}
	await fs.writeFile(outPathChars, JSON.stringify(charsMap, null, 2), "utf8");
	console.log(`Wrote ${outPathChars} with ${Object.keys(charsMap).length} entries`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});


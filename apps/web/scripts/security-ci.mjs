import fs from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(process.cwd(), "../..");
const findings = [];
const floatingLatestDependencyPattern = /"[^"]+"\s*:\s*"latest"/;

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if ([".git", "node_modules", ".next", "dist", "coverage", ".turbo"].includes(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else inspectFile(fullPath);
  }
}

function inspectFile(file) {
  const relative = path.relative(repoRoot, file).replaceAll(path.sep, "/");
  const content = read(file);
  if (content === null || content.includes("\u0000")) return;

  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content)) {
    findings.push(`${relative}: private key material detected`);
  }

  if (/(?:OPENAI_API_KEY|AWS_SECRET_ACCESS_KEY|CLOUDFLARE_R2_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY)\s*=\s*[^\s#][^\r\n]*/.test(content)) {
    if (!relative.endsWith(".env.example")) {
      findings.push(`${relative}: possible hard-coded secret assignment detected`);
    }
  }

  if (/actions\/(?:checkout|setup-node)@v4\b/.test(content)) {
    findings.push(`${relative}: deprecated GitHub Action major v4 detected`);
  }

  if (/codeql-action\/(?:init|analyze|autobuild)@v3\b/.test(content)) {
    findings.push(`${relative}: CodeQL Action v3 detected; v4 is the maintained major`);
  }
}

walk(repoRoot);

const packageJson = read(path.join(process.cwd(), "package.json"));
if (packageJson && floatingLatestDependencyPattern.test(packageJson)) {
  findings.push("apps/web/package.json: floating 'latest' dependency detected");
}

if (fs.existsSync(path.join(process.cwd(), "middleware.ts"))) {
  findings.push("apps/web/middleware.ts: deprecated Next.js middleware convention detected; use proxy.ts");
}

if (findings.length) {
  console.error("Security and deprecation gate failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log("Security and deprecation gate passed.");

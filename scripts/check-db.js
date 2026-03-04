#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eq = line.indexOf("=");
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) process.env[key] = value;
  }
}

async function main() {
  loadDotEnv(path.join(process.cwd(), ".env"));

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is missing. Set it in .env first.");
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    const result = await client.query("select now() as now, current_database() as db");
    console.log("DB connection OK", result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error("DB connection FAILED");
    console.error({
      name: error?.name,
      message: error?.message,
      code: error?.code,
      errno: error?.errno,
      syscall: error?.syscall,
    });
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
}

void main();

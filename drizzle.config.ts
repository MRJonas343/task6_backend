import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env" });

export default defineConfig({
	schema: "./src/db/schemas.ts",
	out: "./migrations",
	dialect: "mysql",
	dbCredentials: {
		url: process.env.DATABASE_URL ?? "",
	},
});

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { blob } from "drizzle-orm/sqlite-core";

export const presentations = sqliteTable("presentations", {
	id: integer("id").primaryKey(),
	creator: text("creator"),
	numberOfSlides: integer("number_of_slides"),
	createdAt: text("created_at"),
	topic: text("topic"),
});

export const participants = sqliteTable("participants", {
	id: integer("id").primaryKey(),
	presentationId: integer("presentation_id"),
	name: text("name"),
	role: text("role"),
});

export const slides = sqliteTable("slides", {
	id: integer("id").primaryKey(),
	presentationId: integer("presentation_id"),
	position: integer("position"),
	canvasElements: text("canvas_elements", { mode: "json" }),
	previewImage: blob("preview_image"),
});

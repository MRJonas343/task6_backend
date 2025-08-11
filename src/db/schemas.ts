import { int, mysqlTable, varchar, json, longtext, timestamp } from "drizzle-orm/mysql-core";

export const presentations = mysqlTable("presentations", {
	id: int("id").primaryKey().autoincrement(),
	creator: varchar("creator", { length: 255 }),
	numberOfSlides: int("number_of_slides"),
	createdAt: timestamp("created_at").defaultNow(),
	topic: varchar("topic", { length: 500 }),
});

export const participants = mysqlTable("participants", {
	id: int("id").primaryKey().autoincrement(),
	presentationId: int("presentation_id"),
	name: varchar("name", { length: 255 }),
	role: varchar("role", { length: 50 }),
});

export const slides = mysqlTable("slides", {
	id: int("id").primaryKey().autoincrement(),
	presentationId: int("presentation_id"),
	position: int("position"),
	canvasElements: json("canvas_elements"),
	previewImage: longtext("preview_image"),
});

import { db } from "../db/index.js";
import { presentations, slides } from "../db/schemas.js";
import { eq, desc } from "drizzle-orm";

export const createSlide = async (presentationId: number) => {
	const position = await db
		.select({ position: slides.position })
		.from(slides)
		.where(eq(slides.presentationId, Number(presentationId)))
		.orderBy(desc(slides.position))
		.limit(1);

	position[0].position = position[0].position + 1;

	//*find the last position

	const result = await db.insert(slides).values({
		presentationId: Number(presentationId),
		position: position[0].position,
		canvasElements: [],
		previewImage: `https://placehold.co/300x150/000000/png?text=slide${position[0].position}`,
	});

	//*update the number of slides in the presentation
	await db
		.update(presentations)
		.set({ numberOfSlides: position[0].position })
		.where(eq(presentations.id, Number(presentationId)));

	//*Get the new slides in the presentation
	const newSlides = await db
		.select()
		.from(slides)
		.where(eq(slides.presentationId, presentationId));

	return newSlides;
};

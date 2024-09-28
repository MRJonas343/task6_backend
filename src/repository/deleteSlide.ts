import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { slides } from "../db/schemas.js";

export const deleteSlide = async (slideId: string, presentationId: string) => {
	await db.delete(slides).where(eq(slides.id, Number(slideId)));

	//*Get all slides
	const newSlides = await db
		.select()
		.from(slides)
		.where(eq(slides.presentationId, Number(presentationId)));
	return newSlides;
};

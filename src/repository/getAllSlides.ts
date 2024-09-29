import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { slides } from "../db/schemas.js";

export const getAllSlides = async (presentationId: number) => {
	const canvasElements = await db
		.select()
		.from(slides)
		.where(eq(slides.presentationId, presentationId));

	const canvasElementsArray = canvasElements.map((element) => {
		return element.canvasElements;
	});

	return canvasElementsArray;
};

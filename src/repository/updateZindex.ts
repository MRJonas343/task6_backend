import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { slides } from "../db/schemas.js";
import type { CanvasElement } from "../interfaces/CanvasElement.js";

export const updateZindex = async (
	elements: CanvasElement[],
	currentSlide: number,
	presentationId: string,
) => {
	//*Update the db with the new elements
	await db
		.update(slides)
		.set({ canvasElements: elements })
		.where(
			and(
				eq(slides.position, currentSlide),
				eq(slides.presentationId, Number(presentationId)),
			),
		);
};

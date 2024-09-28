import { db } from "../db/index.js";
import { slides } from "../db/schemas.js";
import { eq, and } from "drizzle-orm";
import type { CanvasElement } from "../interfaces/CanvasElement.js";

export const getCanvasElements = async (
	presentationId: string,
	slidePosition: number,
) => {
	//*get the canvas elements
	const canvasElements = await db
		.select()
		.from(slides)
		.where(
			and(
				eq(slides.presentationId, Number(presentationId)),
				eq(slides.position, slidePosition),
			),
		);

	const elements = canvasElements[0].canvasElements as CanvasElement[];

	return elements;
};

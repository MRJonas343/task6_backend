import type { CanvasElement } from "../interfaces/CanvasElement.js";
import { db } from "../db/index.js";
import { slides } from "../db/schemas.js";
import { and, eq } from "drizzle-orm";
export const updateCanvasElements = async (
	currentSlide: number,
	newElement: CanvasElement,
	presentationId: string,
) => {
	//*Fist I need to get the current elements
	const currentElements = await db
		.select({
			canvasElements: slides.canvasElements,
		})
		.from(slides)
		.where(
			and(
				eq(slides.position, currentSlide),
				eq(slides.presentationId, Number(presentationId)),
			),
		);

	const elements = currentElements[0].canvasElements as CanvasElement[];
	//*Check if is empty
	if (elements.length === 0) {
		const newElements = newElement;
		//*Update the db
		await db
			.update(slides)
			.set({ canvasElements: [newElements] })
			.where(
				and(
					eq(slides.position, currentSlide),
					eq(slides.presentationId, Number(presentationId)),
				),
			);
		return;
	}

	//*Check if the element already exists with find
	const elementExists = elements.find(
		(element) => element.id === newElement.id,
	);
	//*If not existe add it
	if (!elementExists) {
		const newElements = [...elements, newElement];
		//*Update the db
		await db
			.update(slides)
			.set({ canvasElements: newElements })
			.where(
				and(
					eq(slides.position, currentSlide),
					eq(slides.presentationId, Number(presentationId)),
				),
			);
		return;
	}

	//*If it exists, update it
	const updatedElementIndex = elements.findIndex(
		(element) => element.id === newElement.id,
	);
	elements[updatedElementIndex] = newElement;
	await db
		.update(slides)
		.set({ canvasElements: elements })
		.where(
			and(
				eq(slides.position, currentSlide),
				eq(slides.presentationId, Number(presentationId)),
			),
		);
	return;
};

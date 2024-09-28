import { db } from "../db/index.js";
import { slides } from "../db/schemas.js";
import { and, eq } from "drizzle-orm";

export const updateSlidesOrder = async (
	slide1id: string,
	slide2id: string,
	presentationId: string,
) => {
	console.log(slide1id, slide2id, presentationId);
	//*I need to update not just the postions, but also the canvas elements and the preview images
	const [slide1, slide2] = await Promise.all([
		db
			.select({
				position: slides.position,
				canvasElements: slides.canvasElements,
				previewImage: slides.previewImage,
			})
			.from(slides)
			.where(
				and(
					eq(slides.id, Number(slide1id)),
					eq(slides.presentationId, Number(presentationId)),
				),
			),
		db
			.select({
				position: slides.position,
				canvasElements: slides.canvasElements,
				previewImage: slides.previewImage,
			})
			.from(slides)
			.where(
				and(
					eq(slides.id, Number(slide2id)),
					eq(slides.presentationId, Number(presentationId)),
				),
			),
	]);

	console.log(slide1, slide2);

	//*interchange their positions, canvas elements, and preview images simultaneously
	await Promise.all([
		db
			.update(slides)
			.set({
				position: slide2[0].position,
				canvasElements: slide2[0].canvasElements,
				previewImage: slide2[0].previewImage,
			})
			.where(
				and(
					eq(slides.id, Number(slide1id)),
					eq(slides.presentationId, Number(presentationId)),
				),
			),
		db
			.update(slides)
			.set({
				position: slide1[0].position,
				canvasElements: slide1[0].canvasElements,
				previewImage: slide1[0].previewImage,
			})
			.where(
				and(
					eq(slides.id, Number(slide2id)),
					eq(slides.presentationId, Number(presentationId)),
				),
			),
	]);

	//*Get all slides
	const newSlides = await db
		.select()
		.from(slides)
		.where(eq(slides.presentationId, Number(presentationId)));
	return newSlides;
};

import { db } from "../db/index.js";
import { participants, presentations, slides } from "../db/schemas.js";

export const createPresentation = async (creator: string, topic: string) => {
	const result = await db.insert(presentations).values({
		creator: creator,
		numberOfSlides: 1,
		createdAt: new Date().toLocaleString(),
		topic: topic,
	});

	const [result1, result2] = await Promise.all([
		db.insert(participants).values({
			presentationId: result.lastInsertRowid,
			name: creator,
			role: "creator",
		}),
		db.insert(slides).values({
			presentationId: result.lastInsertRowid.toString(),
			position: 1,
			canvasElements: [],
			previewImage: `https://placehold.co/300x150/000000/png?text=slide${1}`,
		}),
	]);

	return {
		presentationId: result.lastInsertRowid.toString(),
		creator: creator,
		role: "creator",
		topic: topic,
		numberOfSlides: 1,
		slideId: result2.lastInsertRowid.toString(),
		totalOfSlides: 1,
		slidesPreviews: [
			{
				id: result2.lastInsertRowid.toString(),
				slidePreview:
					"https://via.assets.so/img.jpg?w=350&h=150&tc=blue&bg=#000000&t=",
			},
		],
	};
};

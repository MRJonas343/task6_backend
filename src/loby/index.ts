import { Router } from "express";
import { db } from "../db/index.js";
import { participants, presentations, slides } from "../db/schemas.js";
import { and, count, desc, eq } from "drizzle-orm";
import { updateSlidesOrder } from "../repository/updateSlidesOrder.js";
import { sql } from "drizzle-orm";

const lobyRouter = Router();

lobyRouter.post("/createPresentation", async (req, res) => {
	const requestBody = req.body;

	const result = await db.insert(presentations).values({
		creator: requestBody.creator,
		numberOfSlides: 1,
		createdAt: new Date().toLocaleString(),
		topic: requestBody.topic,
	});

	const [result1, result2] = await Promise.all([
		db.insert(participants).values({
			presentationId: result.lastInsertRowid,
			name: requestBody.creator,
			role: "creator",
		}),
		db.insert(slides).values({
			presentationId: result.lastInsertRowid,
			position: 1,
			canvasElements: [],
			previewImage:
				"https://via.assets.so/img.jpg?w=350&h=150&tc=blue&bg=#000000&t=",
		}),
	]);

	res.send({
		presentationId: result.lastInsertRowid.toString(),
		creator: requestBody.creator,
		role: "creator",
		topic: requestBody.topic,
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
	});
});

lobyRouter.get(
	"/joinPresentation/:presentationId/:userName",
	async (req, res) => {
		const presentationId = Number(req.params.presentationId);
		const userName = req.params.userName;

		try {
			const existingParticipant = await db
				.select()
				.from(participants)
				.where(
					and(
						eq(participants.name, userName),
						eq(participants.presentationId, presentationId),
					),
				);

			let currentRole = "viewer";

			if (existingParticipant.length > 0) {
				currentRole = existingParticipant[0].role;
			} else {
				await db.insert(participants).values({
					presentationId: presentationId,
					name: userName,
					role: "viewer",
				});
			}

			const [slidesData, presentationData, participantsData] =
				await Promise.all([
					db
						.select()
						.from(slides)
						.where(eq(slides.presentationId, presentationId)),
					db
						.select()
						.from(presentations)
						.where(eq(presentations.id, presentationId)),
					db
						.select()
						.from(participants)
						.where(eq(participants.presentationId, presentationId)),
				]);

			res.send({
				userName,
				creator: presentationData[0].creator,
				topic: presentationData[0].topic,
				totalOfSlides: presentationData[0].numberOfSlides,
				role: currentRole,
				slidesData: slidesData,
				participants: participantsData,
			});
		} catch (error) {
			console.error("Error joining presentation:", error);
			res.status(500).send({ error: "Failed to join presentation" });
		}
	},
);

lobyRouter.post("/createSlide", async (req, res) => {
	const requestBody = req.body;
	const { presentationId } = requestBody;

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
		previewImage:
			"https://via.assets.so/img.jpg?w=350&h=150&tc=blue&bg=#000000&t=Empty Slide",
	});

	//*update the number of slides in the presentation
	await db
		.update(presentations)
		.set({ numberOfSlides: position[0].position })
		.where(eq(presentations.id, Number(presentationId)));

	res.send({
		presentationId: presentationId,
		sucessFullyCreated: true,
		slideId: result.lastInsertRowid.toString(),
	});
});

lobyRouter.post("/updateSlidesPositions", async (req, res) => {
	const slide1id = req.body.slide1id;
	const slide2id = req.body.slide2id;
	const presentationId = req.body.presentationId;

	const newSlides = await updateSlidesOrder(slide1id, slide2id, presentationId);

	res.send({ sucessFullyUpdated: true });
});

lobyRouter.get("/slidesGallery", async (req, res) => {
	const page = req.headers.page;
	if (!page) return;

	async function getSlidesGallery(page: number) {
		const offset = (page - 1) * 8;

		const slidesPreviews = await db.run(
			sql`
				SELECT
					p.id as presentationId,
					p.topic,
					p.creator,
					(
						SELECT s.preview_image
						FROM slides s
						WHERE s.presentation_id = p.id
						ORDER BY s.position ASC
						LIMIT 1
					) as previewImage,
					COUNT(participants.id) as numberOfParticipants
				FROM presentations p
				LEFT JOIN participants ON participants.presentation_id = p.id
				GROUP BY p.id
				LIMIT 8 OFFSET ${offset}
			`,
		);

		return slidesPreviews;
	}

	const slidesPreviews = await getSlidesGallery(Number(page));

	res.send(slidesPreviews.rows);
});

lobyRouter.get("/getSlideById", async (req, res) => {
	const presentationId = req.headers.presentationid;

	async function getSlideById(presentationId: number) {
		const slideDetails = await db
			.select({
				presentationId: presentations.id,
				topic: presentations.topic,
				creator: presentations.creator,
				previewImage: slides.previewImage,
				numberOfParticipants: count(participants.id).as("numberOfParticipants"),
			})
			.from(presentations)
			.leftJoin(slides, eq(slides.presentationId, presentations.id)) // Unir con slides
			.leftJoin(participants, eq(participants.presentationId, presentations.id)) // Unir con participants
			.where(eq(presentations.id, presentationId)) // Filtrar por presentationId
			.groupBy(presentations.id, slides.previewImage) // Agrupar por ID de presentación y la imagen previa
			.limit(1); // Limitar a un solo resultado

		return slideDetails;
	}

	const slideDetails = await getSlideById(Number(presentationId));

	res.send(slideDetails[0]); // Retorna el primer (y único) resultado
});

export { lobyRouter };

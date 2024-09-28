import { db } from "../db/index.js";
import { participants, presentations } from "../db/schemas.js";
import { eq, not } from "drizzle-orm";
import { and } from "drizzle-orm";

export const getParticipants = async (presentationId: number) => {
	//*get the participants except the creator
	const presentationParticipants = await db
		.select()
		.from(participants)
		.leftJoin(presentations, eq(participants.presentationId, presentations.id))
		.where(
			and(
				eq(participants.presentationId, presentationId),
				not(eq(participants.name, presentations.creator)),
			),
		);

	return presentationParticipants;
};

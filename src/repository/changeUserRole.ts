import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { participants } from "../db/schemas.js";

export const changeUserRole = async (
	presentationId: number,
	userName: string,
	role: string,
) => {
	//*change the role of the user
	await db
		.update(participants)
		.set({ role })
		.where(
			and(
				eq(participants.name, userName),
				eq(participants.presentationId, presentationId),
			),
		);
};

import type { Server, Socket } from "socket.io";
import { deleteSlide } from "../repository/deleteSlide.js";
import { getParticipants } from "../repository/getParticipants.js";
import { createSlide } from "../repository/createSlide.js";
import { changeUserRole } from "../repository/changeUserRole.js";
import { updateSlidesOrder } from "../repository/updateSlidesOrder.js";

export interface cretePresentationData {
	topic: string;
	creator: string;
}

export const socketServer = async (io: Server) => {
	io.on("connection", (socket: Socket) => {
		//*Join to a presentation
		socket.on("joinPresentation", async ({ presentationId, userName }) => {
			socket.join(presentationId);
			io.to(presentationId).emit(
				"participants",
				await getParticipants(presentationId),
			);
		});

		//*Create Slide
		socket.on("createSlide", async ({ presentationId }) => {
			const newSlides = await createSlide(presentationId);
			io.to(presentationId).emit("newSlides", newSlides);
		});

		//*Delete Slide
		socket.on("deleteSlide", async ({ presentationId, slideId }) => {
			const newSlides = await deleteSlide(slideId, presentationId);
			io.to(presentationId).emit("newSlides", newSlides);
		});

		//*Update Slides Positions
		socket.on(
			"updateSlidesPositions",
			async ({ slide1, slide2, presentationId }) => {
				const newSlides = await updateSlidesOrder(
					slide1,
					slide2,
					presentationId,
				);
				io.to(presentationId).emit("newSlides", newSlides);
			},
		);

		//*change role
		socket.on("changeUserRole", async ({ presentationId, userName, role }) => {
			await changeUserRole(presentationId, userName, role);

			io.to(presentationId).emit(
				"participants",
				await getParticipants(presentationId),
			);
		});

		socket.on("disconnect", () => {
			console.log("Socket disconnected");
		});
	});
};

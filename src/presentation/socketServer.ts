import type { Server, Socket } from "socket.io";
import { deleteSlide } from "../repository/deleteSlide.js";
import { getParticipants } from "../repository/getParticipants.js";
import { createSlide } from "../repository/createSlide.js";
import { changeUserRole } from "../repository/changeUserRole.js";
import { updateSlidesOrder } from "../repository/updateSlidesOrder.js";
import type { UpdateCanvasElements } from "../interfaces/CanvasElement.js";
import { updateCanvasElements } from "../repository/updateCanvasElements.js";
import { getCanvasElements } from "../repository/getCanvasElements.js";
import { deleteCanvasElement } from "../repository/deleteCanvasElement.js";
import { updateZindex } from "../repository/updateZindex.js";
import { getAllSlides } from "../repository/getAllSlides.js";

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

		//*Update Canvas Elements
		socket.on(
			"updateElements",
			async ({
				currentSlide,
				newElement,
				presentationId,
			}: UpdateCanvasElements) => {
				await updateCanvasElements(currentSlide, newElement, presentationId);
				const newElements = await getCanvasElements(
					presentationId,
					currentSlide,
				);
				socket.broadcast.to(presentationId).emit("newElements", {
					newElements,
					currentSlide,
				});
			},
		);

		//*Delete Canvas Element
		socket.on(
			"deleteElement",
			async ({ presentationId, elementId, slidePosition }) => {
				await deleteCanvasElement(presentationId, elementId, slidePosition);
				const newElements = await getCanvasElements(
					presentationId,
					slidePosition,
				);
				socket.broadcast.to(presentationId).emit("newElements", {
					newElements,
					currentSlide: slidePosition,
				});
			},
		);

		//*Update Z index
		socket.on(
			"updateZindex",
			async ({ elements, currentSlide, presentationId }) => {
				await updateZindex(elements, currentSlide, presentationId);
				const newElements = await getCanvasElements(
					presentationId,
					currentSlide,
				);
				socket.broadcast.to(presentationId).emit("updateZindexServer", {
					newElements,
					currentSlide,
				});
			},
		);

		//*changeCurrentSlide
		socket.on(
			"changeCurrentSlide",
			async ({ presentationId, slidePosition }) => {
				const newElements = await getCanvasElements(
					presentationId,
					slidePosition,
				);

				socket.emit("updateFullCanvas", {
					newElements,
				});
			},
		);

		socket.on("disconnect", () => {
			console.log("Socket disconnected");
		});
	});
};

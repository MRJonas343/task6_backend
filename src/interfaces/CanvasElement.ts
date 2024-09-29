export type EditorModes = "text" | "circle" | "arrow" | "cursor" | "rectangle";

export type CanvasElement = {
	id: string;
	x: number;
	y: number;
	x2: number;
	y2: number;
	radius?: number;
	width?: number;
	height?: number;
	color: string;
	fillColor?: string;
	rotation?: number;
	type: EditorModes;
	content?: string;
	fontSize?: number;
	isEditing?: boolean;
};

export type UpdateCanvasElements = {
	currentSlide: number;
	newElement: CanvasElement;
	presentationId: string;
	image?: string;
};

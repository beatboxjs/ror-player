import { PatternReference } from "../state/song";
import { Instrument } from "../config";

export enum DragType {
	PLACEHOLDER = "bb-pattern-placeholder",
	PATTERN_RESIZE = "bb-pattern-resize"
}

export interface PatternDragData {
	type: DragType.PLACEHOLDER,
	pattern: PatternReference,
	data?: {
		instr: Instrument,
		idx: number
	}
}

export interface PatternResizeDragData {
	type: DragType.PATTERN_RESIZE,
	instr: Instrument,
	idx: number
}

type DragData = PatternDragData | PatternResizeDragData;

export function setDragData(event: DragEvent, data: DragData): void {
	(event.dataTransfer as DataTransfer).setData("application/json", JSON.stringify({ bbData: data }));
}

export function getDragData(event: DragEvent): DragData | undefined {
	const data = (event.dataTransfer as DataTransfer).getData("application/json");
	if(data) {
		const obj = JSON.parse(data);
		if(obj.bbData)
			return obj.bbData as DragData;
	}
}
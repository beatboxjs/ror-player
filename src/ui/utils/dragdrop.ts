export function tryFindDraggableTarget(event: TouchEvent) {
	let el = event.target as HTMLElement;
	if (el.closest('.no-drag')) {
		return;
	}
	do {
		if (el.draggable === false) {
			continue;
		}
		if (el.draggable === true) {
			return el;
		}
		if (el.getAttribute
			&& el.getAttribute('draggable') === 'true') {
			return el;
		}
	} while ((el = el.parentNode as HTMLElement) && el !== document.body);
}
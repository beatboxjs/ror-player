import config from "../config";

declare global {
	interface HTMLElement {
		_bbScroll?: {
			parent: HTMLElement;
			left: number;
			scrollingDisabled: boolean;
		}
	}
}

export function scrollToElement(element: HTMLElement, scrollFurther: boolean = false, force: boolean = false): void {
	if(!element._bbScroll) {
		let left = 0;
		let curEl: HTMLElement | null = element.offsetParent as HTMLElement;
		const ov = (el: HTMLElement) => {
			const style = getComputedStyle(el);
			return style.overflowX || style.overflow;
		}
		while(curEl && [ "auto", "scroll" ].indexOf(ov(curEl) as any) == -1) {
			left += curEl.offsetLeft;
			curEl = curEl.offsetParent as HTMLElement;
		}

		if(!curEl)
			return;

		element._bbScroll = {
			parent: curEl,
			left,
			scrollingDisabled: false
		};
		element._bbScroll.parent.addEventListener("scroll", () => {
			element._bbScroll!.scrollingDisabled = true;
		});
	}

	if(force)
		element._bbScroll.scrollingDisabled = false;

	const fac1 = (scrollFurther ? 0.1 : 0);
	const fac2 = (scrollFurther ? 0.4 : 0);

	const left = element.offsetLeft + element._bbScroll.left;
	if(!element._bbScroll.scrollingDisabled) {
		if(left + element.offsetWidth > element._bbScroll.parent.scrollLeft + element._bbScroll.parent.offsetWidth * (1-fac1))
			element._bbScroll.parent.scroll({ left: left + element.offsetWidth - element._bbScroll.parent.offsetWidth * (1-fac2), behavior: 'smooth' });
		else if(left < element._bbScroll.parent.scrollLeft)
			element._bbScroll.parent.scroll({ left: left - element._bbScroll.parent.offsetWidth * fac2, behavior: 'smooth' });
	} else if(left >= element._bbScroll.parent.scrollLeft && left + element.offsetWidth <= element._bbScroll.parent.scrollLeft + element._bbScroll.parent.offsetWidth)
		element._bbScroll.scrollingDisabled = false;
}

export function makeAbsoluteUrl(url: string): string {
	return new URL(url, location.href).href;
}

export function readableDate(tstamp: number, tstampBefore: number = 0, tstampAfter: number = 0): string {
	const date = new Date(tstamp*1000);
	const dateBefore = new Date(tstampBefore*1000);
	const dateAfter = new Date(tstampAfter*1000);
	const now = new Date();

	const time = (secs: boolean) => pad(date.getHours()) + ":" + pad(date.getMinutes()) + (secs ? ":" + pad(date.getSeconds()) : "");
	const daysAgo = (d: Date) => Math.round((now.getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()).getTime()) / 86400000);
	const weeksAgo = (d: Date) => Math.round(daysAgo(d)/7);
	const monthsAgo = (d: Date) => Math.round(daysAgo(d)/30.436875);
	const yearsAgo = (d: Date) => Math.round(daysAgo(d)/365.2425);
	const sameMinute = (d1: Date, d2: Date) => sameDay(d1, d2) && d1.getHours() == d2.getHours() && d1.getMinutes() == d2.getMinutes();
	const sameDay = (d1: Date, d2: Date) => d1.getFullYear() == d2.getFullYear() && d1.getMonth() == d2.getMonth() && d1.getDate() == d2.getDate();
	const pad = (n: number) => (n<10 ? '0'+n : n);

	if(sameDay(date, now))
		return "Today " + time(sameMinute(date, dateBefore) || sameMinute(date, dateAfter));

	const days = daysAgo(date);
	if(days <= 12)
		return (days == 1 ? "Yesterday" : days + " days ago") + (sameDay(date, dateBefore) || sameDay(date, dateAfter) ? " " + time(sameMinute(date, dateBefore) || sameMinute(date, dateAfter)) : "");

	const weeks = weeksAgo(date);
	if(weeks <= 6 && weeks != weeksAgo(dateBefore) && weeks != weeksAgo(dateAfter))
		return weeks + " weeks ago";

	const months = monthsAgo(date);
	if(weeks > 6 && months <= 10 && months != monthsAgo(dateBefore) && weeks != monthsAgo(dateAfter))
		return months + " months ago";

	const years = yearsAgo(date);
	if(months > 10 && years != yearsAgo(dateBefore) && years != yearsAgo(dateAfter))
		return years + " year" + (years == 1 ? "" : "s") + " ago";

	let str = pad(date.getDate()) + " " + [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ][date.getMonth()];
	if(date.getFullYear() != now.getFullYear())
		str += " " + date.getFullYear();
	if(sameDay(date, dateBefore) || sameDay(date, dateAfter))
		str += " " + time(sameMinute(date, dateBefore) || sameMinute(date, dateAfter));
	return str;
}

export function isoDate(tstamp: number): string {
	const d = new Date(tstamp*1000);
	const pad = (n: number) => (n<10 ? '0'+n : n);
	return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function getTuneOfTheYear(): string {
	const tunes = Array.isArray(config.tuneOfTheYear) ? config.tuneOfTheYear : [config.tuneOfTheYear];
	return tunes[Math.floor(Math.random() * tunes.length)];
}
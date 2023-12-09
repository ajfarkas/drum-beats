export const $ = (selector, element) => (element || document).querySelector(selector);
export const $$ = (selector, element) => (element || document).querySelectorAll(selector);
export const $id = (selector, element) => (element || document).getElementById(selector);
/* Create Element
 * @param element (String): string name of element to be created.
 * @param attrs (Object): attributes to add to element, key is name, val value
 * @param children (String|Array): text string or element children to add to el
 * @returns new element
**/
export const createElement = (element, attrs, children) => {
	const el = document.createElement(element);
	if (children?.nodeType) throw new Error(`children param should be of type Array`);

	if (attrs) {
		Object.entries(attrs).forEach(([key, val]) => {
			el.setAttribute(key, val);
		});
	}

	if (typeof children === 'string') {
		el.innerText = children;
	} else if (Array.isArray(children)) {
		children.forEach(child => el.appendChild(child));
	}

	return el;
};

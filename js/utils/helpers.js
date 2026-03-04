export function qs(selector, scope = document) {
    return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
}

export function on(element, eventName, handler, options) {
    if (element) {
        element.addEventListener(eventName, handler, options);
    }
}

export function getRootPrefix() {
    const configured = document.body?.dataset.root?.trim();
    if (!configured || configured === ".") {
        return ".";
    }

    return configured.replace(/\/+$/, "");
}

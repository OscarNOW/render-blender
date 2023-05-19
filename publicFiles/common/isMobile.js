function isTouchDevice() {
    return (('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0));
}

export function isMobile() {
    if ('matchMedia' in window)
        return window.matchMedia('(any-hover: none)').matches;
    else
        return isTouchDevice();
}
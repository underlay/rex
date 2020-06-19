export function collect({ values, order, max, }) {
    const array = [];
    for (const a of values) {
        const i = array.findIndex((b) => order(a, b));
        if (i === -1) {
            array.push(a);
        }
        else {
            array.splice(i, 0, a);
        }
        if (array.length > max) {
            array.shift();
        }
    }
    return array;
}
//# sourceMappingURL=collect.js.map
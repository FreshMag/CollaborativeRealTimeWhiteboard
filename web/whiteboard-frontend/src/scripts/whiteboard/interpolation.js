
exports.interpolate = function interpolate(points, path, tension = 1) {
    path.points = catmull_rom_spline(points, tension);
}

/**
 * Main Interpolation function. It is based on the
 * {@link https://en.wikipedia.org/wiki/Cubic_Hermite_spline#Catmull%E2%80%93Rom_spline|Catmull-Rom spline},
 * a special case of a cardinal spline. The following is just a naive implementation using the points the user draws
 * and producing an HTML <code>path</code>. An example can be found {@link https://codepen.io/osublake/pen/BowJed|here}
 * @author Blake Bowen <https://codepen.io/osublake>
 * @param data {[Number]} - Array of the points on which the interpolating path is being created on. All the coordinates are
 * inserted in the array using the pattern x1, y1, x2, y2, ...
 * @param tension {Number} - Tension is a parameter of the spline. It must be between 0 and 1.
 * @returns {string} - The HTML path created with all the points of the interpolating spline.
 */
function catmull_rom_spline(data, tension) {

    if (tension == null || (tension < 0 && tension > 1)) tension = 1;

    const size = data.length;
    const last = size - 4;

    let path = "M" + [data[0], data[1]];

    for (let i = 0; i < size - 2; i +=2) {

        const x0 = i ? data[i - 2] : data[0];
        const y0 = i ? data[i - 1] : data[1];

        const x1 = data[i];
        const y1 = data[i + 1];

        const x2 = data[i + 2];
        const y2 = data[i + 3];

        const x3 = i !== last ? data[i + 4] : x2;
        const y3 = i !== last ? data[i + 5] : y2;

        const cp1x = x1 + (x2 - x0) / 6 * tension;
        const cp1y = y1 + (y2 - y0) / 6 * tension;

        const cp2x = x2 - (x3 - x1) / 6 * tension;
        const cp2y = y2 - (y3 - y1) / 6 * tension;

        path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2];
    }
    return path;
}
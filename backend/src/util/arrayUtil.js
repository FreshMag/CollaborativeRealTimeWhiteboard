/**
 * TODO
 * @param array
 * @param id
 * @returns {boolean}
 */
exports.checkContains = function checkContains(array, id) {
    for (let i = 0; i < array?.length; i++) {
        if (array[i].equals(id)) {
            return true;
        }
    }
    return false;
}
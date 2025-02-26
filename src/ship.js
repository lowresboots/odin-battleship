const Ship = (length) => {
    return {
        length,
        hits: 0,
        hit() {
            this.hits++;
        },
        isSunk() {
            return this.hits >= this.length;
        }
    };
};

module.exports = Ship;
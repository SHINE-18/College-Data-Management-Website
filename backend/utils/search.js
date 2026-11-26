function literalSearch(value, exact = false) {
    if (typeof value !== 'string' || value.length > 128) {
        throw Object.assign(new Error('Search terms must be at most 128 characters'), { statusCode: 400 });
    }
    const term = RegExp.escape(value.trim());
    return new RegExp(exact ? '^' + term + '$' : term, 'i');
}

module.exports = literalSearch;

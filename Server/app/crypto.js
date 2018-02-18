const crypto = require('crypto');

/**
 * This class can be used to perform crypto operations.
 *
 * @author Daniel Strebinger
 * @version 1.0
 * */
class Crypto
{
    /**
     * Generates a key.
     * */
    static generateKey()
    {
        let sha = crypto.createHash('sha256');
        sha.update(Math.random().toString());
        return sha.digest('hex');
    }

    /**
     * Generates a hash value of a given content
     *
     * @param content Contains the content.
     * */
    static generateHashValue(content)
    {
        let sha = crypto.createHash('sha256');
        sha.update(content.toString());
        return sha.digest('hex');
    }

    /**
     * Generats a random number.
     * */
    static generateRandom(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

module.exports = Crypto;
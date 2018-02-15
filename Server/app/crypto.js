const crypto = require('crypto');

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
     * Generats a random number.
     * */
    static generateRandom(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
}

module.exports = Crypto;
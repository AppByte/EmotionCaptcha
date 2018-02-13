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
}

module.exports = Crypto;
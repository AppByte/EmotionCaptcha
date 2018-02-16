const crypto = require('crypto');
const key = "supersecretkey";

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

    static generateHashValue(value)
    {
        let sha = crypto.createHash('sha256');
        sha.update(value.toString());
        return sha.digest('hex');
    }

    static encrypt(data) {
        var cipher = crypto.createCipher('aes-256-cbc', key);
        var crypted = cipher.update(data.toString(), 'utf-8', 'hex');
        crypted += cipher.final('hex');
        return crypted;
    }

    static decrypt(data) {
        var decipher = crypto.createDecipher('aes-256-cbc', key);
        var decrypted = decipher.update(data.toString(), 'hex', 'utf-8');
        decrypted += decipher.final('utf-8');
        return decrypted;
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
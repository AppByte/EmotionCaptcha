/**
 * The filesystem class handles the interaction with the file system of the server.
 *
 * @author Daniel Strebinger
 * @version 1.0
 * */
class FileSystem {

    /**
     * Creates file with a given content if it not exsits.
     * Otherwise the file exists and the content will be appended.
     *
     * @param {string} path - Contains the path to the file.
     * @param data - Contains the data to save.
     * */
    static createOrAppend(path, data)
    {
        let fileSystem = require('fs');
        fileSystem.writeFileSync(path, data, { flag: 'a+' });
    }

    /**
     * Creates file with a given content if it not exsits.
     * Otherwise the file exists and the content will be replace.
     *
     * @param {string} path - Contains the path to the file.
     * @param data - Contains the data to save.
     * */
    static createOrReplace(path, data)
    {
        let fileSystem = require('fs');
        fileSystem.writeFileSync(path, data, { flag: 'w+' });
    }

    /**
     * Creates a directory on a specific path.
     *
     * @param {string} path - Contains the full directory path.
     * */
    static createDirectory(path)
    {
        let fileSystem = require('fs');
        fileSystem.mkdirSync(path);
    }

    /**
     * Gets the file content of a path.
     *
     * @param {string} path - Contains the path to the file.
     * @returns Returns the file content.'key.pem'
     * */
    static getFileContent(path)
    {
        let fileSystem = require('fs');
        return fileSystem.readFileSync(path,'utf8');
    }

    /**
     * Checks if a file at a given path exists or not.
     *
     * @param {string} path - Contains the path to the file.
     * @returns Returns a boolean value indicating whether the file exists or not.
     * */
    static fileExists(path)
    {
        let fileSystem = require('fs');
        return fileSystem.existsSync(path);
    }

    /**
     * Checks if a directory at a given path exists or not.
     *
     * @param {string} path - Contains the path to the directory.
     * @returns Returns a boolean value indicating whether the directory exists or not.
     * */
    static directoryExists(path)
    {
        let fileSystem = require('fs');
        return fileSystem.existsSync(path);
    }

    /**
     * Removes a directory at a given path.
     *
     * @param {string} path - Contains the path to the directory.
     * */
    static removeDirectory(path)
    {
        let fileSystem = require('fs');
        FileSystem.removeContentOfDirectory(path);
        fileSystem.rmdirSync(path);
    }

    /**
     * Removs a file at a given path.
     *
     * @param {string} path - Contains the path to the file.
     * */
    static removeFile(path)
    {
        let fileSystem = require('fs');
        fileSystem.unlinkSync(path);
    }

    /**
     * Copies a file from a directory to another.
     *
     * @param {string} src The path where the original file is located.
     * @param {string} dest The path where the new file will be located
     * @returns {bool} Returns a boolean value indicating whether the process was successful or not.
     * */
    static copyFile(src, dest)
    {
        if (!FileSystem.fileExists(src))
        {
            return false;
        }

        let fileSystem = require('fs');
        fileSystem.writeFileSync(dest, FileSystem.getFileContent(src));

        return true;
    }
}

module.exports = FileSystem;
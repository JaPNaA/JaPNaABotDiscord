class BotCommandOptions {
    /**
     * BotCommandOptions
     * @param {Object} options command triggering options
     * @param {String} [options.requiredPermission] required permission to run command
     * @param {Boolean} [options.noDM] prevent use of command in DMs
     */
    constructor(options) {
        this.requiredPermission = options.requiredPermission;
        this.noDM = options.noDM;
    }
}

module.exports = BotCommandOptions;
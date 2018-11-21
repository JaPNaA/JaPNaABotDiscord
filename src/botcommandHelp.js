class BotCommandHelp {
    /**
     * Bot Command Help constructor
     * @param {Object} data data of help
     * @param {String} data.description description of what the command does
     * @param {Object<string, string>[]} [data.overloads] possible arguments of the command
     * @param {String[][]} [data.examples] examples of the command being used [command, explanation]
     */
    constructor(data) {
        /** 
         * Description of what the command does
         * @type {String}
         */
        this.description = data.description;
        
        /**
         * Contains all available types of arguments
         * @type {Object<string, string>[]}
         */
        this.overloads = data.overloads;

        /**
         * Examples of the use of the command
         * @type {String[][]}
         */
        this.examples = data.examples;
    }
}

module.exports = BotCommandHelp;
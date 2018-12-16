class BotEvent {
    constructor() {
        /** 
         * All events and handlers
         * @type {Object.<string, Function[]>}
         * @private
         */
        this.events = {
            "message": [],
            "command": [],
            "send": [],
            "senddm": [],
            "sent": [],
            "start": [],
            "stop": [],
            "beforememorywrite": [],
            "aftermemorywrite": [],
            "addasync": [],
            "doneasync": []
        };
    }

    /**
     * Adds event listener
     * @param {String} name name of event
     * @param {Function} func handler/callback function
     */
    addEventListener(name, func) {
        this.events[name].push(func);
    }

    /**
     * Call all event handlers for event
     * @param {String} name of event
     * @param {*} event Event data sent with dispatch
     */
    dispatchEvent(name, event) {
        for (let handler of this.events[name]) {
            handler(this, event);
        }
    }
}

module.exports = BotEvent;
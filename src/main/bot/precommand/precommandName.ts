import { Precommand } from "./precommand";

class PrecommandName {
    /** Associated Precommand */
    public precommand: Precommand;
    /** Index of precommand name in parent precommand */
    public index: number;
    /** The precommand string */
    public name: string;

    constructor(precommand: Precommand, index: number) {
        this.precommand = precommand;
        this.index = index;
        this.name = precommand.names[index];
    }
}

export default PrecommandName;
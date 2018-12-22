import Precommand from "./precommand";

class PrecommandName {
    precommand: Precommand;
    index: number;
    name: string;

    constructor(precommand: Precommand, index: number) {
        this.precommand = precommand;
        this.index = index;
        this.name = precommand.names[index];
    }
}

export default PrecommandName;
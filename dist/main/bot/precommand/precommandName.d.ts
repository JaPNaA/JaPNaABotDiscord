import { Precommand } from "./precommand";
declare class PrecommandName {
    /** Associated Precommand */
    precommand: Precommand;
    /** Index of precommand name in parent precommand */
    index: number;
    /** The precommand string */
    name: string;
    constructor(precommand: Precommand, index: number);
}
export default PrecommandName;

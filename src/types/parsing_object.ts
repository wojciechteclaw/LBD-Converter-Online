import { ParserSettings } from "ifc-lbd";

export type ParsingObject = {
    file: File;
    parserSettings: ParserSettings;
    modelID: number
};

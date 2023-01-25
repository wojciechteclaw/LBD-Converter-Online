import { ParserSettings } from "ifc-lbd";

export type ParsingObject = {
    fileName: string;
    parserSettings: ParserSettings;
    modelID: number
};

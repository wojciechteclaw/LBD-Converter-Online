import { ParserSettings } from "ifc-lbd";

type IfcModel = {
    file: File;
    id: number;
    name: string;
    parserSettings: ParserSettings;
};

export { IfcModel };

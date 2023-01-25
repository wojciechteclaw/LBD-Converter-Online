import { ParsingObject } from "@/types/parsing_object";
import { ParserSettings, SerializationFormat } from "ifc-lbd";

class FilesService {
    private fileObjects: Array<ParsingObject> = [];

    private defaultParserSettings: ParserSettings = {
        namespace: "http://www.w3.org/2000/svg",
        subsets: {
            BOT: true,
            FSO: false,
            PRODUCTS: true,
            PROPERTIES: false,
        },
        outputFormat: SerializationFormat.JSONLD,
        normalizeToSIUnits: true,
        verbose: true,
    };

    public addFile(file: File, parserSettings: ParserSettings = this.defaultParserSettings): void {
        this.fileObjects.push({ file, parserSettings });
    }

    public removeFile(fileIndex: number): void {
        this.fileObjects.splice(fileIndex, 1);
    }

    public getAllFileObjects(): ParsingObject[] {
        return this.fileObjects;
    }

    public getFile(index: number): File {
        return this.fileObjects[index].file;
    }

    public overrideParserSettings(index: number, parserSettings: ParserSettings): void {
        this.fileObjects[index].parserSettings = parserSettings;
    }

    public getParserSettings(index: number): ParserSettings {
        return this.fileObjects[index].parserSettings;
    }
}

export { FilesService };

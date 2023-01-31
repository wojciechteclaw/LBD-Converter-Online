import { ParsingObject } from "@/types/parsing_object";
import { ParserSettings, SerializationFormat } from "ifc-lbd";
import { ifcManagerService } from "./dependency_injection";

class FilesService {
    private fileObjects: Array<ParsingObject> = [];

    private defaultParserSettings: ParserSettings = {
        namespace: "http://www.w3.org/",
        subsets: {
            BOT: true,
            FSO: true,
            PRODUCTS: false,
            PROPERTIES: false,
        },
        outputFormat: SerializationFormat.JSONLD,
        normalizeToSIUnits: false,
        verbose: false,
    };

    public async addFile(file: File, parserSettings: ParserSettings = this.defaultParserSettings): Promise<void> {
        let modelID = await ifcManagerService.appendFileToIfcAPI(file).then((e) => e);
        this.fileObjects.push({ fileName: file.name, parserSettings, modelID });
    }

    public async removeFile(modelID: number): Promise<void> {
        ifcManagerService.removeFileFromIfcAPI(modelID);
        this.fileObjects = this.fileObjects.filter((parsingObject) => parsingObject.modelID !== modelID);
    }

    public getAllFileObjects(): ParsingObject[] {
        return this.fileObjects;
    }

    public overrideParserSettings(index: number, parserSettings: ParserSettings): void {
        this.fileObjects[index].parserSettings = parserSettings;
    }

    public getParserSettings(index: number): ParserSettings {
        return this.fileObjects[index].parserSettings;
    }

    public static async readInputFile(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onloadend = (e) => resolve((e.target as FileReader).result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
}

export { FilesService };

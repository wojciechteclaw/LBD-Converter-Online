import { ParsingObject } from "@/types/parsing_object";
import { ParserSettings, SerializationFormat } from "ifc-lbd";
import { ifcManagerService } from "./dependency_injection";

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

    public async addFile(file: File, parserSettings: ParserSettings = this.defaultParserSettings): Promise<void> {
        let modelID = await ifcManagerService.appendFileToIfcAPI(file).then((e) => e);
        this.fileObjects.push({ file, parserSettings, modelID });
        console.log('added file')
    }

    public async removeFile(fileIndex: number): Promise<void> {
        ifcManagerService.removeFileFromIfcAPI(fileIndex);
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

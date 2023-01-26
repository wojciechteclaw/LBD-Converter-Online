import { IfcAPI } from "web-ifc";
import { FilesService } from "./files_service";

class IfcManagerService {
    private ifcAPI: IfcAPI = new IfcAPI();
    private ifcModelExpressIdGuidsMap: Map<number, Map<number | string, number | string>> = new Map();

    constructor() {
        this.configureIfcAPI();
    }

    private configureIfcAPI() {
        let assetsPath = "../../assets/";
        this.ifcAPI.SetWasmPath(assetsPath);
        this.ifcAPI.Init();
    }

    public async appendFileToIfcAPI(file: File): Promise<number> {
        let fileBuffer = await FilesService.readInputFile(file).then((e) => e);
        let parsedBuffer = new Uint8Array(fileBuffer);
        let modelID = this.ifcAPI.OpenModel(parsedBuffer);
        await this.appendExpressIdGuidMap(modelID);
        return modelID;
    }

    private async appendExpressIdGuidMap(modelID: number): Promise<void> {
        this.ifcAPI.CreateIfcGuidToExpressIdMapping(modelID);
        let mapping = this.ifcAPI.ifcGuidMap.get(modelID);
        if (mapping) {
            this.ifcModelExpressIdGuidsMap.set(modelID, mapping);
        }
    }

    public async removeFileFromIfcAPI(modelID: number): Promise<void> {
        this.ifcAPI.CloseModel(modelID);
        await this.removeExpressIdGuidMap(modelID);
    }

    private async removeExpressIdGuidMap(modelID: number): Promise<void> {
        this.ifcModelExpressIdGuidsMap.delete(modelID);
    }
}

export { IfcManagerService };

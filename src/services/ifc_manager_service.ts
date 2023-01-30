import { ModelIDExpressIDSpacesMap } from "@/types/expressId_spaces_geometry";
import { JSONLD, LBDParser } from "ifc-lbd";
import { IfcAPI } from "web-ifc";
import { dbDataController, filesService } from "./dependency_injection";
import { FilesService } from "./files_service";
import { GeometryService } from "./geometry_service";

class IfcManagerService {
    private ifcAPI: IfcAPI = new IfcAPI();
    private ifcModelExpressIdGuidsMap: Map<number, Map<number | string, number | string>> = new Map();
    private modelIDsExpressGeometry: ModelIDExpressIDSpacesMap = new Map();

    constructor() {
        this.configureIfcAPI();
    }

    public async mergeFiles() {
        console.time("filesMerging");
        let items = filesService.getAllFileObjects();
        for (let i = 0; i < items.length; i++) {
            let lbdParser = new LBDParser(items[i].parserSettings);
            await lbdParser.parse(this.ifcAPI, items[i].modelID).then(async (e) => {
                await dbDataController.addJsonLdToStore(e as JSONLD);
            });
        }
        alert("Files merged");
        console.timeEnd("filesMerging");
        dbDataController.saveStoreData();
    }

    public async appendFileToIfcAPI(file: File): Promise<number> {
        let fileBuffer = await FilesService.readInputFile(file).then((e) => e);
        let parsedBuffer = new Uint8Array(fileBuffer);
        let modelID = this.ifcAPI.OpenModel(parsedBuffer);
        await this.appendExpressIdGuidMap(modelID);
        let geometryResults = await GeometryService.getSpacesGeometryForModelID(modelID, this.ifcAPI).then((e) => e);
        this.modelIDsExpressGeometry.set(modelID, geometryResults);
        console.log(this.modelIDsExpressGeometry, this.ifcModelExpressIdGuidsMap);
        return modelID;
    }

    private configureIfcAPI() {
        let assetsPath = "../../assets/";
        this.ifcAPI.SetWasmPath(assetsPath);
        this.ifcAPI.Init();
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

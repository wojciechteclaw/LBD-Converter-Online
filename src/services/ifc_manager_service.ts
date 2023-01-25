import { Color, IfcAPI, IfcConnectionGeometry, IfcGeometry, IFCSPACE, PlacedGeometry } from "web-ifc";
import * as THREE from "three";
import { FilesService } from "./files_service";
import { GeometryService } from "./geometry_service";
import { ModelIDExpressIDSpacesMap } from "@/types/expressId_spaces_geometry";
import { ExpressIDSpacesMap } from "@/types/guid_spaces_map";

class IfcManagerService {
    private ifcAPI: IfcAPI = new IfcAPI();
    private ifcSpacesGeometry: ModelIDExpressIDSpacesMap = new Map();
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
        await this.appendSpacesGeometryMap(modelID);
        return modelID;
    }

    private async appendSpacesGeometryMap(modelID): Promise<void> {
        let spacesGeometryMap = await GeometryService.getSpacesGeometry(modelID, this.ifcAPI).then((e) => e);
        this.ifcSpacesGeometry.set(modelID, spacesGeometryMap);
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

    private async removeSpacesGeometryMap(modelID: number): Promise<void> {}
}

export { IfcManagerService };

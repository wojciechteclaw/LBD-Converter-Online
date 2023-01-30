import { ModelIDExpressContextBasedGuid } from "@/types/expressId_spaces_geometry";
import { JSONLD, LBDParser } from "ifc-lbd";
import { Vector3 } from "three";
import { IfcAPI } from "web-ifc";
import { v5 as uuidv5 } from "uuid";
import { dbDataController, filesService } from "./dependency_injection";
import { FilesService } from "./files_service";
import { GeometryService } from "./geometry_service";
import { DBDataController } from "./db/db_data_controller";
import { Connection } from "../enums/connection";
import { NewSemanticConnection } from "../types/new_semantic_connection";
import { getConnectionPredicate } from "../helpers/connection_predicates";

class IfcManagerService {
    private ifcAPI: IfcAPI = new IfcAPI();
    private ifcModelExpressIdGuidsMap: Map<number, Map<number | string, number | string>> = new Map();
    private modelIDsExpressStringGuid: ModelIDExpressContextBasedGuid = new Map();
    private connections: Array<NewSemanticConnection> = new Array();

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
        this.joinModels();
        await dbDataController.saveStoreData();
    }

    private static async contextBasedGuid(contextString: string) {
        const namespace = "daca0510-72b5-48ba-9091-b918ca18136b";
        return uuidv5(contextString, namespace);
    }

    public static async getContextBasedGuid(
        sphereCenter: Vector3,
        radius: number,
        volume: number,
        numberOfIndexPoints: number
    ): Promise<string> {
        let contextString = `${Math.round(sphereCenter.x)} ${Math.round(sphereCenter.y)}
        ${Math.round(sphereCenter.z)} ${Math.round(radius)} ${Math.round(volume)} ${numberOfIndexPoints}`;
        return await IfcManagerService.contextBasedGuid(contextString);
    }

    public async appendFileToIfcAPI(file: File): Promise<number> {
        let fileBuffer = await FilesService.readInputFile(file).then((e) => e);
        let parsedBuffer = new Uint8Array(fileBuffer);
        let modelID = this.ifcAPI.OpenModel(parsedBuffer);
        await this.appendExpressIdGuidMap(modelID);
        let geometryResults = await GeometryService.getExpressIdContextGuidMap(modelID, this.ifcAPI).then((e) => e);
        this.modelIDsExpressStringGuid.set(modelID, geometryResults);
        return modelID;
    }

    public joinModels() {
        let modelsToCompare = DBDataController.getModelIdForComparison(this.modelIDsExpressStringGuid);
        for (let modelPair of modelsToCompare) {
            this.compareTwoModels(modelPair[0], modelPair[1]);
        }
        console.log(this.connections.length);
        dbDataController.addConnectionsToStore(this.connections);
    }

    public compareTwoModels(model1ID, model2ID) {
        let model1Elements = this.modelIDsExpressStringGuid.get(model1ID);
        let model2Elements = this.modelIDsExpressStringGuid.get(model2ID);
        if (model1Elements && model2Elements) {
            for (let [expressID1, contextBasedGuid1] of model1Elements) {
                for (let [expressID2, contextBasedGuid2] of model2Elements) {
                    if (contextBasedGuid1 === contextBasedGuid2) {
                        this.addConnection(model1ID, expressID1, model2ID, expressID2, Connection.SAME_AS);
                    }
                }
            }
        }
    }

    public addConnection(model1ID, expressID1, model2ID, expressID2, connectionType, isBidirectional = true) {
        let predicate = getConnectionPredicate(connectionType);
        let item1URI = this.GetURI(model1ID, expressID1);
        let item2URI = this.GetURI(model2ID, expressID2);
        if (item1URI != item2URI) {
            this.connections.push({ subject: item1URI, object: item2URI, predicate: predicate });
            if (isBidirectional) {
                this.connections.push({ subject: item2URI, object: item1URI, predicate: predicate });
            }
        }
        return true;
    }

    private GetURI(modelID: number, expressID: number): string {
        let settings = filesService.getParserSettings(modelID);
        let prefix = settings.namespace.endsWith("/") ? settings.namespace : settings.namespace + "/";
        let guid = this.ifcModelExpressIdGuidsMap.get(modelID)!.get(expressID);
        return prefix + guid;
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

import { ModelIDExpressContextGuid } from "@/types/express_id_context_guid";
import { JSONLD, LBDParser } from "ifc-lbd";
import { Vector3 } from "three";
import { IfcAPI, IfcBuildingStorey } from "web-ifc";
import { v5 as uuidv5 } from "uuid";
import { dbDataController, filesService } from "./dependency_injection";
import { FilesService } from "./files_service";
import { GeometryService } from "./geometry_service";
import { DBDataController } from "./db/db_data_controller";
import { Connection } from "../enums/connection";
import { NewSemanticConnection } from "../types/new_semantic_connection";
import { getConnectionPredicate } from "../helpers/connection_predicates";
import { ExpressIDContextGuid } from "@/types/guid_spaces_map";
import { GuidUriService } from "./guid_uri_service";

class IfcManagerService {
    private ifcAPI: IfcAPI = new IfcAPI();
    private ifcModelExpressIdGuidsMap: Map<number, Map<number | string, number | string>> = new Map();
    private modelIDsExpressStringGuid: ModelIDExpressContextGuid = new Map();
    private connections: Array<NewSemanticConnection> = new Array();

    constructor() {
        this.configureIfcAPI();
    }

    public async appendFileToIfcAPI(file: File): Promise<number> {
        let fileBuffer = await FilesService.readInputFile(file).then((e) => e);
        let parsedBuffer = new Uint8Array(fileBuffer);
        let modelID = this.ifcAPI.OpenModel(parsedBuffer);
        await this.appendExpressIdGuidMap(modelID);
        let promises = Array<Promise<ExpressIDContextGuid>>();
        promises.push(GeometryService.getSpacesContextGuidMap(modelID, this.ifcAPI));
        promises.push(GeometryService.getLevelsContextGuidMap(modelID, this.ifcAPI));
        let [spaces, levels] = await Promise.all(promises);
        const mergedMaps: ExpressIDContextGuid = new Map([...spaces.entries(), ...levels.entries()]);
        this.modelIDsExpressStringGuid.set(modelID, mergedMaps);
        return modelID;
    }

    public compareTwoModelsContextGuids(model1ID, model2ID) {
        const model1Elements = this.modelIDsExpressStringGuid.get(model1ID) as ExpressIDContextGuid;
        const model2Elements = this.modelIDsExpressStringGuid.get(model2ID) as ExpressIDContextGuid;
        for (const [expressID1, contextBasedGuid1] of model1Elements) {
            for (const [expressID2, contextBasedGuid2] of model2Elements) {
                if (contextBasedGuid1 === contextBasedGuid2) {
                    this.addConnection(model1ID, expressID1, model2ID, expressID2, Connection.SAME_AS);
                }
            }
        }
    }

    public getExpressIDGuidMap(modelID: number, expressID: number): string | undefined {
        let model = this.ifcModelExpressIdGuidsMap.get(modelID);
        if (model !== undefined) {
            return model.get(expressID) as string;
        }
    }

    public joinModels() {
        let modelsToCompare = DBDataController.getModelIdForComparison(this.modelIDsExpressStringGuid);
        for (let modelPair of modelsToCompare) {
            this.compareTwoModelsContextGuids(modelPair[0], modelPair[1]);
        }
        dbDataController.addConnectionsToStore(this.connections);
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
        await this.joinModels();
        await dbDataController.saveStoreData();
    }

    public async removeFileFromIfcAPI(modelID: number): Promise<void> {
        this.ifcAPI.CloseModel(modelID);
        await this.removeExpressIdGuidMap(modelID);
    }

    private addConnection(model1ID, expressID1, model2ID, expressID2, connectionType, isBidirectional = true) {
        let predicate = getConnectionPredicate(connectionType);
        let item1URI = GuidUriService.getElementURI(model1ID, expressID1);
        let item2URI = GuidUriService.getElementURI(model2ID, expressID2);
        this.connections.push({ subject: item1URI, object: item2URI, predicate: predicate });
        if (isBidirectional) {
            this.connections.push({ subject: item2URI, object: item1URI, predicate: predicate });
        }
        return true;
    }

    private async appendExpressIdGuidMap(modelID: number): Promise<void> {
        this.ifcAPI.CreateIfcGuidToExpressIdMapping(modelID);
        let mapping = this.ifcAPI.ifcGuidMap.get(modelID);
        if (mapping) {
            this.ifcModelExpressIdGuidsMap.set(modelID, mapping);
        }
    }

    private configureIfcAPI() {
        let assetsPath = "../../assets/";
        this.ifcAPI.SetWasmPath(assetsPath);
        this.ifcAPI.Init();
    }

    private async removeExpressIdGuidMap(modelID: number): Promise<void> {
        this.ifcModelExpressIdGuidsMap.delete(modelID);
    }
}

export { IfcManagerService };

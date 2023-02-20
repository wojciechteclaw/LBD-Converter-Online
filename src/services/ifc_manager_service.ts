import { JSONLD, LBDParser } from "ifc-lbd";
import { IfcAPI, IFCSPACE } from "web-ifc";
import { DBDataController } from "./db_data_controller";
import { dbDataController, filesService } from "./dependency_injection";
import { FilesService } from "./files_service";
import { GeometryService } from "./geometry_service";
import { GuidUriService } from "./guid_uri_service";
import { Connection } from "@enums/connection";
import { getConnectionPredicate } from "@helpers/connection_predicates";
import { ModelIdsRepresentation } from "@/types/model_ids_representations";
import { NewSemanticConnection } from "@/types/new_semantic_connection";
import { ExpressIdToElementRepresentation } from "@/types/element_representation/express_id_to_element_representation";
import { Representation } from "@enums/representation";
import { ElementRepresentation } from "@/types/element_representation/element_representation";
import { StringRepresentation } from "@/types/element_representation/string_representation";
import { GeometricalRepresentation } from "@/types/element_representation/geometrical_representation";

class IfcManagerService {
    private ifcAPI: IfcAPI = new IfcAPI();
    private ifcModelExpressIdGuidsMap: Map<number, Map<number | string, number | string>> = new Map();
    private representationMaps: ModelIdsRepresentation = new Map();
    private connections: Array<NewSemanticConnection> = new Array();

    constructor() {
        this.ifcAPI.SetWasmPath("./assets/");
        this.ifcAPI.Init();
    }

    public async appendFileToIfcAPI(file: File): Promise<number> {
        let fileBuffer = await FilesService.readInputFile(file).then((e) => e);
        let parsedBuffer = new Uint8Array(fileBuffer);
        let modelID = this.ifcAPI.OpenModel(parsedBuffer);
        await this.appendExpressIdGuidMap(modelID);
        let promises = Array<Promise<ExpressIdToElementRepresentation>>();
        promises.push(GeometryService.getSpacesContextGuidMap(modelID, this.ifcAPI));
        promises.push(GeometryService.getLevelsContextGuidMap(modelID, this.ifcAPI));
        let [spaces, levels] = await Promise.all(promises);
        const mergedMaps: ExpressIdToElementRepresentation = new Map([...spaces.entries(), ...levels.entries()]);
        this.representationMaps.set(modelID, mergedMaps);
        return modelID;
    }

    private compareModelsElements<T>(
        model1Id: number,
        model2Id: number,
        model1Elements: ExpressIdToElementRepresentation,
        model2Elements: ExpressIdToElementRepresentation,
        representation: Representation,
        compare: (model1Element: T, model2Element: T) => boolean
    ) {
        let model1ElementsArray = Array.from(model1Elements.entries()).filter((e) => e[1].type === representation);
        let model2ElementsArray = Array.from(model2Elements.entries()).filter((e) => e[1].type === representation);
        for (const [expressID1, model1Element] of model1ElementsArray) {
            for (const [expressID2, model2Element] of model2ElementsArray) {
                let areTheSame = compare(model1Element as T, model2Element as T);
                console.log(areTheSame, expressID1, expressID2)
                if (areTheSame) {
                    this.addConnection(model1Id, expressID1, model2Id, expressID2, Connection.SAME_AS);
                }
            }
        }
    }

    private static compareLevels(level1string: StringRepresentation, level2string: StringRepresentation): boolean {
        return level1string.contextString === level2string.contextString;
    }

    private async compareModels(model1ID, model2ID) {
        const model1Elements = this.representationMaps.get(model1ID) as ExpressIdToElementRepresentation;
        const model2Elements = this.representationMaps.get(model2ID) as ExpressIdToElementRepresentation;

        this.compareModelsElements<GeometricalRepresentation>(
            model1ID,
            model2ID,
            model1Elements,
            model2Elements,
            Representation.SPACE,
            GeometryService.compareTwoGeometryRepresentations
        );
        this.compareModelsElements<StringRepresentation>(
            model1ID,
            model2ID,
            model1Elements,
            model2Elements,
            Representation.LEVEL,
            IfcManagerService.compareLevels
        );
    }

    public getExpressIDGuidMap(modelID: number, expressID: number): string | undefined {
        let model = this.ifcModelExpressIdGuidsMap.get(modelID);
        if (model !== undefined) {
            return model.get(expressID) as string;
        }
    }

    public async mergeFiles() {
        let items = filesService.getAllFileObjects();
        for (let parserObject of items) {
            let lbdParser = new LBDParser(parserObject.parserSettings);
            await lbdParser.parse(this.ifcAPI, parserObject.modelID).then(async (e) => {
                await dbDataController.addJsonLdToStore(e as JSONLD);
            });
        }
        await this.joinModels();
    }

    public async removeFileFromIfcAPI(modelID: number): Promise<void> {
        this.ifcAPI.CloseModel(modelID);
        await this.removeExpressIdGuidMap(modelID);
    }

    private async addConnection(
        model1ID: number,
        expressID1: number,
        model2ID: number,
        expressID2: number,
        connectionType: Connection,
        isBidirectional: Boolean = true
    ) {
        let predicate = getConnectionPredicate(connectionType);
        let item1URI = GuidUriService.getElementURI(model1ID, expressID1);
        let item2URI = GuidUriService.getElementURI(model2ID, expressID2);
        this.connections.push({ subject: item1URI, object: item2URI, predicate: predicate });
        if (isBidirectional) {
            this.connections.push({ subject: item2URI, object: item1URI, predicate: predicate });
        }
    }

    private async appendExpressIdGuidMap(modelID: number): Promise<void> {
        this.ifcAPI.CreateIfcGuidToExpressIdMapping(modelID);
        let mapping = this.ifcAPI.ifcGuidMap.get(modelID);
        if (mapping) {
            this.ifcModelExpressIdGuidsMap.set(modelID, mapping);
        }
    }

    private async joinModels() {
        console.time("sample");
        let modelsToCompare = DBDataController.getModelIdForComparison(this.representationMaps);
        const promises = Array<Promise<void>>();
        for (let modelPair of modelsToCompare) {
            promises.push(this.compareModels(modelPair[0], modelPair[1]));
        }
        await Promise.all(promises);
        await dbDataController.addConnectionsToStore(this.connections);
        console.timeEnd("sample");
    }

    private async removeExpressIdGuidMap(modelID: number): Promise<void> {
        this.ifcModelExpressIdGuidsMap.delete(modelID);
    }
}

export { IfcManagerService };

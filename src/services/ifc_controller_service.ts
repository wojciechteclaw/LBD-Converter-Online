import { JSONLD, LBDParser, ParserSettings } from "ifc-lbd";
import { FlatMesh, IfcAPI, IFCBUILDINGSTOREY, IFCSPACE } from "web-ifc";
import { Representation } from "@enums/representation";
import { Connection } from "@enums/connection";
import { ElementsComparison } from "@helpers/elements_comparison";
import { FileOperations } from "@helpers/file_operations";
import { GeometryOperations } from "@helpers/geometry_operations";
import { GuidOperations } from "@helpers/guid_operations";
import { ConnectedElements } from "@/types/connected_elements";
import { IfcElement } from "@/types/ifc_element";
import { ConnectorsManager } from "@services/connectors_manager";

class IfcControllerService {
    
    private ifcAPI: IfcAPI = new IfcAPI();
    constructor() {
        this.ifcAPI.SetWasmPath("./assets/");
        this.ifcAPI.Init();
    }

    public async addFile(file: File): Promise<number> {
        const parsedBuffer = await FileOperations.getFileBuffer(file);
        const modelID = await this.ifcAPI.OpenModel(parsedBuffer);
        return modelID;
    }

    public async getAllUnconnectedConnectors(modelID: number): Promise<IfcElement[]> {
        const connectorManager = new ConnectorsManager(this.ifcAPI);
        await connectorManager.addUnconnectedConnectors(modelID);
        return connectorManager.getAllUnconnectedElements();
    }

    public async convertModelToLBD(parserSettings: ParserSettings, modelID: number = 0): Promise<JSONLD> {
        const lbdParser = new LBDParser(parserSettings);
        return lbdParser.parse(this.ifcAPI, modelID).then((e) => e as JSONLD);
    }

    public removeFile(modelID: number) {
        this.ifcAPI.CloseModel(modelID);
    }

    public async getConnectionElements(modelID: number) {
        const promises = Array<Promise<IfcElement[]>>();
        promises.push(this.getSpaceElements(modelID));
        promises.push(this.getLevelElements(modelID));
        const [spaces, levels] = await Promise.all(promises);
        return [...spaces, ...levels];
    }

    private async getSpaceElements(modelID: number) {
        const result: IfcElement[] = [];
        this.ifcAPI.StreamAllMeshesWithTypes(modelID, [IFCSPACE], async (flatMesh: FlatMesh) => {
            const mesh = GeometryOperations.getMesh(modelID, this.ifcAPI, flatMesh);
            const id = flatMesh.expressID;
            const guid = this.ifcAPI.GetLine(modelID, id).GlobalId.value;
            let item: IfcElement = {
                id: id,
                guid: guid,
                modelID: modelID,
                representation: {
                    type: Representation.SPACE,
                    mesh: mesh,
                    volume: await GeometryOperations.getVolume(mesh.geometry),
                },
            };
            result.push(item);
        });
        return result;
    }

    public static async getRelationsBetweenModelElements(
        model1Elements: IfcElement[],
        model2Elements: IfcElement[],
        connections: ConnectedElements[]
    ): Promise<void> {
        await Promise.all([
            ElementsComparison.compareElements(
                model1Elements,
                model2Elements,
                connections,
                Representation.LEVEL,
                ElementsComparison.compareStringRepresentations,
                Connection.SAME_AS
            ),
            ElementsComparison.compareElements(
                model1Elements,
                model2Elements,
                connections,
                Representation.SPACE,
                ElementsComparison.compareGeometryRepresentations,
                Connection.SAME_AS
            ),
            ElementsComparison.compareConnectors(model1Elements, model2Elements, connections, Representation.CONNECTOR),
        ]);
    }

    private async getLevelElements(modelID: number) {
        const result: IfcElement[] = [];
        const levels = this.ifcAPI.GetLineIDsWithType(modelID, IFCBUILDINGSTOREY);
        for (let i = 0; i < levels.size(); i++) {
            let id = levels.get(i);
            const level = this.ifcAPI.GetLine(modelID, id);
            const guid = level.GlobalId.value;
            let item: IfcElement = {
                id: id,
                guid: guid,
                modelID: modelID,
                representation: {
                    type: Representation.LEVEL,
                    contextString: GuidOperations.getLevelContextBasedGuid(level),
                },
            };
            await result.push(item);
        }
        return result;
    }
}

export { IfcControllerService };

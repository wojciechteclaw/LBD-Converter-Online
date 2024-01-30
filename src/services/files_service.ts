import { JSONLD, ParserSettings, SerializationFormat } from "ifc-lbd";
import { dbDataController, ifcControllerService } from "@services/dependency_injection";
import { IfcControllerService } from "@services/ifc_controller_service";
import { ConnectedElements } from "@/types/connected_elements";
import { IfcElement } from "@/types/ifc_element";
import { IfcModel } from "@/types/ifc_model";
import { ModelElements } from "@/types/model_elements";
import { SemanticOperations } from "@helpers/semantic_operations";

class FilesService {
    private models: Array<IfcModel> = [];
    private elements: ModelElements = {};
    private readonly DEFAULT_PARSER_SETTINGS: ParserSettings = {
        namespace: "http://www.sample.org/",
        subsets: {
            BOT: true,
            FSO: true,
            PRODUCTS: true,
            PROPERTIES: true,
        },
        outputFormat: SerializationFormat.JSONLD,
        normalizeToSIUnits: false,
        verbose: false,
    };

    public async addFile(file: File, parserSettings: ParserSettings = this.DEFAULT_PARSER_SETTINGS): Promise<void> {
        let modelID = await ifcControllerService.addFile(file);
        this.models.push({
            file: file,
            id: modelID,
            name: file.name,
            parserSettings: parserSettings,
        });
        const modelElements = await ifcControllerService.getConnectionElements(modelID);
        const modelConnectors = await ifcControllerService.getAllUnconnectedConnectors(modelID);
        this.elements[modelID] = [...modelElements, ...modelConnectors];
    }

    public getAllModels(): IfcModel[] {
        return this.models;
    }

    public getModel(modelID: number): IfcModel {
        return this.models[modelID];
    }

    public getModelParserSettings(modelID: number): ParserSettings {
        let element = this.models.find((model) => model.id === modelID);
        if (element) {
            return element.parserSettings;
        }
        return this.DEFAULT_PARSER_SETTINGS;
    }

    public getModelNamespace(modelID: number): string {
        return this.getModelParserSettings(modelID).namespace;
    }

    public async parseFiles(): Promise<void> {
        const modelIDs = this.models.keys();
        const results: Array<JSONLD> = [];
        for (const modelID of modelIDs) {
            let model = await this.getModel(modelID);
            let result = await ifcControllerService.convertModelToLBD(model.parserSettings, model.id);
            results.push(result);
        }
        results.forEach(async (result) => {
            await SemanticOperations.getTriplesFromJSONLD(result).then((quads) =>
                dbDataController.addQuadsToStore(quads)
            );
        });
    }

    public async mergeFiles(): Promise<void> {
        dbDataController.clearStore();
        await this.parseFiles();
        await this.discoverModelsConnections();
    }

    public overrideParserSettings(modelID: number, parserSettings: ParserSettings): void {
        let element = this.models.find((model) => model.id === modelID);
        if (element) {
            element.parserSettings = parserSettings;
        }
    }

    public removeModel(modelID: number): void {
        ifcControllerService.removeFile(modelID);
        this.models = this.models.filter((model) => model.id !== modelID);
        delete this.elements[modelID];
    }

    private getModelComparisonElements(modelID: number): IfcElement[] {
        return this.elements[modelID];
    }

    private async discoverModelsConnections(): Promise<void> {
        console.time("Model federation took:");
        const modelIDs = Array.from(this.models.keys());
        const modelIDpairs = FilesService.getModelIdForComparison(modelIDs);
        const connectedElements: ConnectedElements[] = [];
        const promises = new Array<Promise<void>>();
        modelIDpairs.forEach(async (modelIDpair) => {
            const model1Elements = this.getModelComparisonElements(modelIDpair[0]);
            const model2Elements = this.getModelComparisonElements(modelIDpair[1]);
            promises.push(
                IfcControllerService.getRelationsBetweenModelElements(model1Elements, model2Elements, connectedElements)
            );
        });
        await Promise.all(promises);
        let connectionTriples = [];
        SemanticOperations.getTriplesFromConnectedElements(connectedElements, connectionTriples);
        await dbDataController.addQuadsToStore(connectionTriples);
        console.timeEnd("Model federation took:");
    }

    private static getModelIdForComparison(modelIDs: number[]): Array<Array<number>> {
        let result = new Array<Array<number>>();
        let set = new Set();
        for (let i = 0; i < modelIDs.length; i++) {
            for (let j = 0; j < modelIDs.length; j++) {
                if (i != j && !set.has(i + "," + j) && !set.has(j + "," + i)) {
                    set.add(i + "," + j);
                    result.push([modelIDs[i], modelIDs[j]]);
                }
            }
        }
        return result;
    }
}

export { FilesService };

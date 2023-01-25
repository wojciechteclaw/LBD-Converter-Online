import { JSONLD, LBDParser, ParserSettings, Subsets } from "ifc-lbd";
import { quad, Quad, initSync } from "oxigraph/web";
import { FlatMesh, IfcAPI, IFCSPACE, IfcGeometry } from "web-ifc";
import { TriplesStore } from "./triples_store";
import * as jsonld from "jsonld";

class DBDataController {
    private store: TriplesStore = new TriplesStore();
    private lbdParser = new LBDParser();

    // constructor() {
    //     this.configureIfcAPI();
    // }

    // private async getAllSpaces(modelID: number) {
    //     const allSpaces = this.ifcAPI.GetLineIDsWithType(0, IFCSPACE);
    //     for (let i = 0; i < allSpaces.size(); i++) {
    //         const expressID = allSpaces.get(i);
    //         const flatMesh: FlatMesh = this.ifcAPI.GetFlatMesh(modelID, expressID);
    //         const geometry: IfcGeometry = this.ifcAPI.GetGeometry(modelID, expressID);
    //         console.log(flatMesh);
    //         console.log(geometry);
    //     }
    // }

    // private async overwriteLBDParserWithSettings(settings: ParserSettings) {
    //     this.lbdParser = new LBDParser(settings);
    // }

    // public async appendFileToIfcAPI(file: File, settings: ParserSettings) {
    //     await this.overwriteLBDParserWithSettings(settings);
    //     let fileBuffer = await this.readInputFile(file).then((e) => e as ArrayBufferLike);
    //     let parsedBuffer = new Uint8Array(fileBuffer);
    //     this.ifcAPI.OpenModel(parsedBuffer);
    //     let convertedTriples = await this.convertModelToTriples(settings.subsets).then((e) => e);
    //     let mergedTriples = await this.mergeMultipleTriples(convertedTriples).then((e) => e);
    //     let quads = await this.getQuadsFromTriples(mergedTriples).then((e) => e);
    //     this.store.addTriples(quads);
    //     this.downloadData(mergedTriples, "mergerTriples");
    //     this.ifcAPI.CloseModel(0);
    // }

    // private async convertModelToTriples(conversion: Subsets): Promise<Array<JSONLD>> {
    //     const promises = Array<Promise<JSONLD>>();
    //     if (conversion.BOT) {
    //         promises.push(this.lbdParser.parseBOTTriples(this.ifcAPI, 0).then((e) => e as JSONLD));
    //     }
    //     if (conversion.FSO) {
    //         promises.push(this.lbdParser.parseFSOTriples(this.ifcAPI, 0).then((e) => e as JSONLD));
    //     }
    //     if (conversion.PRODUCTS) {
    //         promises.push(this.lbdParser.parseProductTriples(this.ifcAPI, 0).then((e) => e as JSONLD));
    //     }
    //     if (conversion.PROPERTIES) {
    //         promises.push(this.lbdParser.parsePropertyTriples(this.ifcAPI, 0).then((e) => e as JSONLD));
    //     }
    //     return await Promise.all(promises).then((e) => e);
    // }

    // private async downloadData(triples: string | JSONLD, filename: string): Promise<void> {
    //     const content = JSON.stringify(triples, null, 2);
    //     const fileType = "application/ld+json";
    //     filename = `${filename}.jsonld`;
    //     const blob = new Blob([content], { type: fileType });
    //     const a = document.createElement("a");
    //     a.download = filename;
    //     a.href = URL.createObjectURL(blob);
    //     a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
    //     a.style.display = "none";
    //     a.click();
    // }

    // private async mergeMultipleTriples(graphs: Array<JSONLD>): Promise<JSONLD> {
    //     if (graphs.length < 2) {
    //         return graphs[0];
    //     }
    //     let context = graphs[0]["@context"];
    //     let graph = graphs[0]["@graph"];
    //     graphs.slice(1).forEach((modelTriples) => {
    //         context = { ...context, ...modelTriples["@context"] };
    //         graph.push(...modelTriples["@graph"]);
    //     });
    //     return { "@context": context, "@graph": graph };
    // }

    // private async getQuadsFromTriples(triples: any): Promise<Array<Quad>> {
    //     const jsonLd = await jsonld.toRDF(triples as jsonld.JsonLdDocument);
    //     return Object.values(jsonLd).map((e) => DBDataController.getQuadFromTriple(e));
    // }

    // private static getQuadFromTriple(triple: any) {
    //     return quad(triple.subject, triple.predicate, triple.object, triple.graph);
    // }

    // private readInputFile(file: File) {
    //     return new Promise((resolve, reject) => {
    //         let reader = new FileReader();
    //         reader.addEventListener("loadend", (e) => resolve((e.target as FileReader).result));
    //         reader.addEventListener("error", reject);
    //         reader.readAsArrayBuffer(file);
    //     });
    // }
}

export { DBDataController };

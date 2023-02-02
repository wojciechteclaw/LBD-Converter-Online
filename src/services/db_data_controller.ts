import { JSONLD } from "ifc-lbd";
import init, * as oxigraph from "oxigraph/web";
import * as jsonld from "jsonld";
import { ModelIDExpressContextGuid } from "@/types/express_id_context_guid";
import { NewSemanticConnection } from "@/types/new_semantic_connection";

class DBDataController {
    private store: oxigraph.Store;

    constructor() {
        console.time("Store initialized");
        (async () => {
            await init();
            this.store = new oxigraph.Store();
        })();
        console.timeEnd("TripleStore initialized");
    }

    public async addJsonLdToStore(jsonLd: JSONLD): Promise<void> {
        await DBDataController.getQuadsFromTriples(jsonLd).then((quads: oxigraph.Quad[]) => {
            quads.forEach((triple: oxigraph.Quad) => {
                this.store.add(triple);
            });
        });
    }

    public addConnectionsToStore(connections: NewSemanticConnection[]): void {
        for (let connection of connections) {
            let quad = DBDataController.getTriple(connection);
            this.store.add(quad);
        }
    }

    public static getModelIdForComparison(modelIDsExpressGeometry: ModelIDExpressContextGuid): Array<Array<number>> {
        let result = new Array<Array<number>>();
        let set = new Set();
        let modelIDs = Array.from(modelIDsExpressGeometry.keys());
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

    public saveStoreData(): void {
        let data = this.store.dump("text/turtle", undefined);
        DBDataController.dumpData(data);
    }

    private static dumpData(triples: string, fileName: string = "mergedFiles.ttl"): void {
        const fileType = "text/turtle";
        const blob = new Blob([triples], { type: fileType });
        const a = document.createElement("a");
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
        a.style.display = "none";
        a.click();
    }

    private static getQuadFromTriple(triple: any) {
        return oxigraph.quad(triple.subject, triple.predicate, triple.object, triple.graph);
    }

    private static async getQuadsFromTriples(triples: any): Promise<oxigraph.Quad[]> {
        const jsonLd = await jsonld.toRDF(triples as jsonld.JsonLdDocument).then((e) => e);
        let result = Object.values(jsonLd).map((e) => DBDataController.getQuadFromTriple(e));
        return result;
    }

    private static getTriple(connection: NewSemanticConnection): oxigraph.Quad {
        return oxigraph.triple(
            oxigraph.namedNode(connection.subject),
            oxigraph.namedNode(connection.predicate),
            oxigraph.namedNode(connection.object)
        );
    }
}

export { DBDataController };

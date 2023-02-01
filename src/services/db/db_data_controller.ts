import { JSONLD } from "ifc-lbd";
import { quad, Quad } from "oxigraph/web";
import { TriplesStore } from "./triples_store";
import * as jsonld from "jsonld";
import { ModelIDExpressContextGuid } from "@/types/express_id_context_guid";
import { NewSemanticConnection } from "@/types/new_semantic_connection";

class DBDataController {
    private store: TriplesStore = new TriplesStore();

    public async addJsonLdToStore(jsonLd: JSONLD): Promise<void> {
        let quads = await this.getQuadsFromTriples(jsonLd).then((e) => e);
        this.store.addTriples(quads);
    }

    public addConnectionsToStore(connections: NewSemanticConnection[]): void {
        this.store.addConnections(connections);
    }

    private dumpData(triples: string, fileName: string = "mergedFiles.ttl"): void {
        const fileType = "text/turtle";
        const blob = new Blob([triples], { type: fileType });
        const a = document.createElement("a");
        a.download = fileName;
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
        a.style.display = "none";
        a.click();
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
        let data = this.store.dump();
        this.dumpData(data);
    }

    private static getQuadFromTriple(triple: any) {
        return quad(triple.subject, triple.predicate, triple.object, triple.graph);
    }

    private async getQuadsFromTriples(triples: any): Promise<Quad[]> {
        const jsonLd = await jsonld.toRDF(triples as jsonld.JsonLdDocument).then((e) => e);
        let result = Object.values(jsonLd).map((e) => DBDataController.getQuadFromTriple(e));
        return result;
    }
}

export { DBDataController };

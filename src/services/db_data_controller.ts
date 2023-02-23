import init, * as oxigraph from "oxigraph/web";
import { ModelIdsRepresentation } from "@/types/model_ids_representations";
import { ConnectedElements } from "@/types/connected_elements";

class DBDataController {
    private store: oxigraph.Store;

    constructor() {
        (async () => {
            await init();
            this.store = new oxigraph.Store();
        })();
    }

    public clearStore(): void {
        this.store = new oxigraph.Store();
    }

    public query(query: string): oxigraph.Quad[] | undefined {
        let result: oxigraph.Quad[] | undefined;
        try {
            result = this.store.query(query) as oxigraph.Quad[];
        } catch (e) {}
        console.log(result);
        return result;
    }

    public addQuadsToStore(quads: oxigraph.Quad[]): void {
        for (let quad of quads) {
            this.store.add(quad);
        }
    }

    public static getModelIdForComparison(modelIDsExpressGeometry: ModelIdsRepresentation): Array<Array<number>> {
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

    public convertConnectedElementsToTriples(connections: ConnectedElements[]) {}

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
}

export { DBDataController };

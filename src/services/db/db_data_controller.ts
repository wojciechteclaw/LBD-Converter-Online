import { JSONLD } from "ifc-lbd";
import { quad, Quad } from "oxigraph/web";
import { TriplesStore } from "./triples_store";
import * as jsonld from "jsonld";

class DBDataController {
    private store: TriplesStore = new TriplesStore();

    public async addJsonLdToStore(jsonLd: JSONLD): Promise<void> {
        let quads = await this.getQuadsFromTriples(jsonLd).then((e) => e);
        this.store.addTriples(quads);
    }

    private downloadData(triples: string | JSONLD, filename: string): void {
        const content = JSON.stringify(triples, null, 2);
        const fileType = "application/ld+json";
        filename = `${filename}.jsonld`;
        const blob = new Blob([content], { type: fileType });
        const a = document.createElement("a");
        a.download = filename;
        a.href = URL.createObjectURL(blob);
        a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
        a.style.display = "none";
        a.click();
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

    public logReport(): void {
        this.store.report();
    }

    private async getQuadsFromTriples(triples: any): Promise<Quad[]> {
        const jsonLd = await jsonld.toRDF(triples as jsonld.JsonLdDocument).then((e) => e);
        let result = Object.values(jsonLd).map((e) => DBDataController.getQuadFromTriple(e));
        return result;
    }

    private static getQuadFromTriple(triple: any) {
        return quad(triple.subject, triple.predicate, triple.object, triple.graph);
    }

    public saveStoreData(): void {
        let data = this.store.dump();
        console.log(data);
        this.dumpData(data);
    }
}

export { DBDataController };

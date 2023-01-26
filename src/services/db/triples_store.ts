import init, * as oxigraph from "oxigraph/web";

class TriplesStore {
    private store: oxigraph.Store;

    constructor() {
        (async () => {
            await init();
            this.store = new oxigraph.Store();
            console.log("Store initialized");
            console.log(this.store);
        })();
    }

    public addTriples(triples: oxigraph.Quad[]) {
        triples.forEach((triple: oxigraph.Quad) => {
            this.store.add(triple);
        });
    }

    public report(): void {
        console.log(this.store.size);
    }

    public dump(): string {
        return this.store.dump("text/turtle", undefined);
    }
}

export { TriplesStore };

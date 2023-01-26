import init, * as oxigraph from "oxigraph/web";

class TriplesStore {
    private store: oxigraph.Store;

    constructor() {
        Promise.resolve(async () => {
            await init();
            this.store = new oxigraph.Store();
        });
    }

    addTriples(triples: oxigraph.Quad[]) {
        triples.forEach((triple: oxigraph.Quad) => {
            this.store.add(triple);
        });
        this.report();
    }

    report() {
        console.log(this.store.size);
    }
}

export { TriplesStore };

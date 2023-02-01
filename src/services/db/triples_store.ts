import init, * as oxigraph from "oxigraph/web";
import { NewSemanticConnection } from "@/types/new_semantic_connection";

class TriplesStore {
    private store: oxigraph.Store;

    constructor() {
        console.time("Store initialized");
        (async () => {
            await init();
            this.store = new oxigraph.Store();
        })();
        console.timeEnd("TripleStore initialized");
    }

    public addConnections(connections: NewSemanticConnection[]) {
        for (let connection of connections) {
            let quad = this.getTriple(connection);
            this.store.add(quad);
        }
    }

    public addTriples(triples: oxigraph.Quad[]) {
        triples.forEach((triple: oxigraph.Quad) => {
            this.store.add(triple);
        });
    }

    public dump(): string {
        return this.store.dump("text/turtle", undefined);
    }

    private getTriple(connection: NewSemanticConnection): oxigraph.Quad {
        return oxigraph.triple(
            oxigraph.namedNode(connection.subject),
            oxigraph.namedNode(connection.predicate),
            oxigraph.namedNode(connection.object)
        );
    }
}

export { TriplesStore };

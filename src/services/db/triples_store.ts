import { NewSemanticConnection } from "@/types/new_semantic_connection";
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

    private getTriplple(connection: NewSemanticConnection): oxigraph.Quad {
        return oxigraph.triple(
            oxigraph.namedNode(connection.subject),
            oxigraph.namedNode(connection.predicate),
            oxigraph.namedNode(connection.object)
        );
    }

    public addConnections(connections: NewSemanticConnection[]) {
        for (let connection of connections) {
            let quad = this.getTriplple(connection);
            this.store.add(quad);
        }
    }
}

export { TriplesStore };

import { Connection } from "@enums/connection";
import { ConnectedElements } from "@/types/connected_elements";
import * as oxigraph from "oxigraph/web";
import { filesService } from "@services/dependency_injection";
import * as jsonld from "jsonld";
import { GuidOperations } from "./guid_operations";

class SemanticOperations {
    private static getTripleFromConnectedElements(
        connection: ConnectedElements,
        connectionTriples: oxigraph.Quad[]
    ): void {
        let connectionSpecificTriples: oxigraph.Quad[] = [];
        switch (connection.relation) {
            case Connection.SAME_AS:
                connectionSpecificTriples = this.generateTriplesForSameAsConnection(connection);
                break;
            default:
                break;
        }
        connectionTriples.push(...connectionSpecificTriples);
    }

    private static getObjectSubjectURIs(connection: ConnectedElements): string[] {
        let objectURI =
            filesService.getModelNamespace(connection.object.modelID) +
            GuidOperations.encodeURI(connection.object.guid);
        let subjectURI =
            filesService.getModelNamespace(connection.subject.modelID) +
            GuidOperations.encodeURI(connection.subject.guid);
        return [objectURI, subjectURI];
    }

    private static generateTriplesForSameAsConnection(connection: ConnectedElements): oxigraph.Quad[] {
        let [objectURI, subjectURI] = this.getObjectSubjectURIs(connection);
        return [
            oxigraph.triple(
                oxigraph.namedNode(objectURI),
                this.getPredicateFromConnection(connection),
                oxigraph.namedNode(subjectURI)
            ),
            oxigraph.triple(
                oxigraph.namedNode(subjectURI),
                this.getPredicateFromConnection(connection),
                oxigraph.namedNode(objectURI)
            ),
        ];
    }

    public static getTriplesFromConnectedElements(
        connections: ConnectedElements[],
        connectionTriples: oxigraph.Quad[]
    ): void {
        for (let connection of connections) {
            this.getTripleFromConnectedElements(connection, connectionTriples);
        }
    }

    private static getPredicateFromConnection(connection: ConnectedElements): oxigraph.NamedNode {
        switch (connection.relation) {
            case Connection.SAME_AS:
                return oxigraph.namedNode("http://www.w3.org/2002/07/owl#sameAs");
            default:
                return oxigraph.namedNode("");
        }
    }

    private static getJsonldBasedTriple(triple: any): oxigraph.Quad {
        return oxigraph.quad(triple.subject, triple.predicate, triple.object, triple.graph);
    }

    public static async getTriplesFromJSONLD(data: any): Promise<oxigraph.Quad[]> {
        const jsonLd = await jsonld.toRDF(data as jsonld.JsonLdDocument).then((e) => e);
        return Object.values(jsonLd).map((e) => this.getJsonldBasedTriple(e));
    }
}

export { SemanticOperations };

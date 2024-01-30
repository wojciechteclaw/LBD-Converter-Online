import { Connection } from "@enums/connection";
import { ConnectedElements } from "@/types/connected_elements";
import * as oxigraph from "oxigraph/web";
import { filesService } from "@services/dependency_injection";
import * as jsonld from "jsonld";
import { GuidOperations } from "./guid_operations";
import { ConnectorRepresentation } from "@/types/element_representation/connector_representation";

class SemanticOperations {
    private static getTripleFromConnectedElements(
        connection: ConnectedElements,
        connectionTriples: oxigraph.Quad[]
    ): void {
        let connectionSpecificTriples: oxigraph.Quad[] = [];
        switch (connection.relation) {
            case Connection.GEOMETRICALLY_EQUIVALENT:
                connectionSpecificTriples = this.generateTriplesForSameAsConnection(connection);
                break;
            case Connection.CONNECTED_PORT:
                connectionSpecificTriples = this.generateTriplesForMepElements(connection);
                console.log(connectionSpecificTriples);
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

    private static getMepObjectSubjectParentsURIs(connection: ConnectedElements): string[] {
        let objectURI =
            filesService.getModelNamespace(connection.object.modelID) +
            GuidOperations.encodeURI((connection.object.representation as ConnectorRepresentation).connector.parentId);
        let subjectURI =
            filesService.getModelNamespace(connection.subject.modelID) +
            GuidOperations.encodeURI((connection.subject.representation as ConnectorRepresentation).connector.parentId);
        return [objectURI, subjectURI];
    }

    private static generateTriplesForMepElements(connection: ConnectedElements): oxigraph.Quad[] {
        const [objectURI, subjectURI] = this.getObjectSubjectURIs(connection);
        const [objectParentURI, subjectParentURI] = this.getMepObjectSubjectParentsURIs(connection);
        const relation = connection.relation;
        return [
            oxigraph.triple(
                oxigraph.namedNode(objectURI),
                this.getPredicateFromConnection(relation),
                oxigraph.namedNode(subjectURI)
            ),
            oxigraph.triple(
                oxigraph.namedNode(subjectURI),
                this.getPredicateFromConnection(relation),
                oxigraph.namedNode(objectURI)
            ),
            oxigraph.triple(
                oxigraph.namedNode(subjectParentURI),
                this.getPredicateFromConnection(Connection.SUPPLIES_FLUID_TO),
                oxigraph.namedNode(objectParentURI)
            ),
            oxigraph.triple(
                oxigraph.namedNode(objectParentURI),
                this.getPredicateFromConnection(Connection.HAS_FLUID_SUPPLIED_BY),
                oxigraph.namedNode(subjectParentURI)
            ),
        ];
    }

    private static generateTriplesForSameAsConnection(connection: ConnectedElements): oxigraph.Quad[] {
        let [objectURI, subjectURI] = this.getObjectSubjectURIs(connection);
        return [
            oxigraph.triple(
                oxigraph.namedNode(objectURI),
                this.getPredicateFromConnection(connection.relation),
                oxigraph.namedNode(subjectURI)
            ),
            oxigraph.triple(
                oxigraph.namedNode(subjectURI),
                this.getPredicateFromConnection(connection.relation),
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

    private static getPredicateFromConnection(connection: Connection): oxigraph.NamedNode {
        switch (connection) {
            case Connection.GEOMETRICALLY_EQUIVALENT:
                return oxigraph.namedNode("http://example.com/ex#geometricallyEquivalent");
            case Connection.CONNECTED_PORT:
                return oxigraph.namedNode("https://w3id.org/fso#connectedPort");
            case Connection.CONNECTED_WITH:
                return oxigraph.namedNode("https://w3id.org/fso#connectedWith");
            case Connection.HAS_FLUID_SUPPLIED_BY:
                return oxigraph.namedNode("https://w3id.org/fso#hasFluidSuppliedBy");
            case Connection.SUPPLIES_FLUID_TO:
                return oxigraph.namedNode("https://w3id.org/fso#suppliesFluidTo");
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

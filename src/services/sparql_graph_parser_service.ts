import { Quad, Literal, NamedNode } from "oxigraph/web";
import { v4 as uuidv4 } from "uuid";
import { colorsManager } from "./dependency_injection";
import { GuidUriService } from "./guid_uri_service";
import { CustomElementData } from "@/types/graph/custom_element_data";
import { EdgeElement } from "@/types/graph/edge_element";
import { EdgeElementData } from "@/types/graph/edge_element_data";
import { GraphElementsDefinition } from "@/types/graph/graph_elements_definition";
import { NodeElement } from "@/types/graph/node_element";
import { NodeElementData } from "@/types/graph/node_element_data";

class SparQlGraphParserService {
    private queryResult: Quad[];
    private nodes: { [key: string]: NodeElement } = {};
    private edges: EdgeElement[] = [];

    constructor(queryResult: Quad[]) {
        this.queryResult = queryResult;
    }

    public convertQueryResultToGraphInput(): GraphElementsDefinition {
        for (const binding of this.queryResult) {
            let subject = SparQlGraphParserService.getNode(binding.subject);
            let object = SparQlGraphParserService.getNode(binding.object);
            let edge = SparQlGraphParserService.getEdge(binding.predicate);
            edge.source = subject.id;
            edge.target = object.id;
            edge.id = subject.id + object.id;
            this.edges.push({ data: edge });
            this.nodes[binding.subject.value] = { data: subject };
            this.nodes[binding.object.value] = { data: object };
        }
        let result = {
            nodes: Object.values(this.nodes),
            edges: this.edges,
        };
        return result;
    }

    private static getNode(node: NamedNode | Literal): NodeElementData {
        let result: NodeElementData;
        if (node.termType === "NamedNode") {
            result = SparQlGraphParserService.getElementBody(node.value);
        } else {
            result = {
                id: node.value !== "" ? GuidUriService.encodeURI(node.value) : uuidv4(),
                namespace: "OWL",
                body: node.value,
                label: node.value,
                prefix: "",
            };
        }
        let color = colorsManager.getColorByNamespace(result.namespace);
        return { color: color, ...result };
    }

    private static getEdge(edge: NamedNode): EdgeElementData {
        return SparQlGraphParserService.getElementBody(edge.value) as EdgeElementData;
    }

    private static getElementBody(str: string): CustomElementData {
        if (!str.includes("http")) {
            return {
                id: uuidv4(),
                namespace: "Literal",
                body: GuidUriService.decodeURI(str),
                label: GuidUriService.decodeURI(str),
                prefix: "",
            };
        }
        let character = str.includes("#") ? "#" : "/";
        return SparQlGraphParserService.splitStringByCharacter(str, character);
    }

    private static splitStringByCharacter(str: string, character: string): CustomElementData {
        var splitString = str.split(character);
        var firstPart = splitString.slice(0, splitString.length - 1).join(character) + character;
        var lastPart = splitString[splitString.length - 1];
        let prefix = SparQlGraphParserService.getPrefix(firstPart);
        let body = GuidUriService.decodeURI(lastPart);
        return {
            id: str,
            namespace: firstPart,
            body: GuidUriService.decodeURI(lastPart),
            prefix: prefix,
            label: prefix + body,
        };
    }

    private static getPrefix(namespace: string): string {
        let prefix = SparQlGraphParserService.MOST_POPULAR_PREFIXES[namespace];
        if (prefix) {
            return prefix + ":";
        }
        return "inst:";
    }

    private static readonly MOST_POPULAR_PREFIXES = {
        "https://w3id.org/bot#": "bot",
        "https://w3id.org/fog#": "fog",
        "https://w3id.org/fso#": "fso",
        "http://ifcowl.openbimstandards.org/IFC2X3_Final#": "ifc",
        "https://w3id.org/kobl/building-topology#": "kbt",
        "https://w3id.org/omg#": "omg",
        "http://www.w3.org/2002/07/owl#": "owl",
        "http://qudt.org/schema/qudt/#": "qudt",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "rdf",
        "http://www.w3.org/2000/01/rdf-schema#": "rdfs",
        "https://w3id.org/tso#": "tso",
        "http://www.w3.org/2001/XMLSchema#": "xsd",
    };
}

export { SparQlGraphParserService };

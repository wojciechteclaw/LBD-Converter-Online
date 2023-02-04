import { Quad, Literal, NamedNode } from "oxigraph/web";
import { GuidUriService } from "./guid_uri_service";
import { colorsManager } from "./dependency_injection";
import { EdgeElement } from "@/types/graph/edge_element";
import { GraphElementsDefinition } from "@/types/graph/graph_elements_definition";
import { NodeElement } from "@/types/graph/node_element";
import { NodeElementData } from "@/types/graph/node_element_data";
import { CustomElementData } from "@/types/graph/custom_element_data";
import { EdgeElementData } from "@/types/graph/edge_element_data";

class SparQlGraphParserService {
    private queryResult: Quad[];
    private nodes: { [key: string]: NodeElement } = {};
    private edges: EdgeElement[] = [];

    constructor(queryResult: Quad[]) {
        this.queryResult = queryResult;
    }

    public async convertQueryResultToGraphInput(): Promise<GraphElementsDefinition> {
        for (const binding of this.queryResult) {
            let [subject, object] = await Promise.all([
                SparQlGraphParserService.getNode(binding.subject),
                SparQlGraphParserService.getNode(binding.object),
            ]).then((e) => e);
            let edge = await SparQlGraphParserService.getLink(binding.predicate).then((e) => e);
            edge.source = subject.id;
            edge.target = object.id;
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

    private static async getNode(node: NamedNode | Literal): Promise<NodeElementData> {
        let result: NodeElementData;
        if (node.termType === "NamedNode") {
            result = await SparQlGraphParserService.getElementBody(node.value).then((e) => e);
        } else {
            result = {
                id: GuidUriService.encodeURI(node.value),
                namespace: "OWL",
                body: node.value,
            };
        }
        let color = await colorsManager.getColorByNamespace(result.namespace).then((e) => e);
        return { color: color, ...result };
    }

    private static async getLink(link: NamedNode): Promise<EdgeElementData> {
        return (await SparQlGraphParserService.getElementBody(link.value)) as EdgeElementData;
    }

    private static async getElementBody(str: string): Promise<CustomElementData> {
        if (!str.includes("http")) {
            return {
                id: str,
                namespace: "Literal",
                body: GuidUriService.decodeURI(str),
            };
        }
        let character = str.includes("#") ? "#" : "/";
        return await SparQlGraphParserService.splitStringByCharacter(str, character).then((e) => e);
    }

    private static async splitStringByCharacter(str: string, character: string): Promise<CustomElementData> {
        var splitString = str.split(character);
        var firstPart = splitString.slice(0, splitString.length - 1).join(character) + character;
        var lastPart = splitString[splitString.length - 1];
        return {
            id: str,
            namespace: firstPart,
            body: GuidUriService.decodeURI(lastPart),
        };
    }
}

export { SparQlGraphParserService };

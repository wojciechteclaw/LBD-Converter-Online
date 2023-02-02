import { Quad, Literal, NamedNode } from "oxigraph/web";
import { GuidUriService } from "./guid_uri_service";
import { colorsManager } from "./dependency_injection";
import { LinkElement } from "@/types/link_element";
import { NodeElement } from "@/types/node_element";
import { ElementBody } from "@/types/element_body";
import { GraphData } from "react-force-graph-2d";

class SparQlGraphParserService {
    private queryResult: Quad[];
    private nodes: { [key: string]: NodeElement } = {};
    private links: LinkElement[] = [];

    constructor(queryResult: Quad[]) {
        this.queryResult = queryResult;
    }

    public async convertQueryResultToGraphInput(): Promise<GraphData> {
        for (const binding of this.queryResult) {
            let [subject, object] = await Promise.all([
                SparQlGraphParserService.getNode(binding.subject),
                SparQlGraphParserService.getNode(binding.object),
            ]).then((e) => e);
            let link = await SparQlGraphParserService.getLink(binding.predicate).then((link) => link);
            link.source = subject.id;
            link.target = object.id;
            this.links.push(link);
            this.nodes[binding.subject.value] = subject;
            this.nodes[binding.object.value] = object;
        }
        let result = {
            nodes: Object.values(this.nodes),
            links: this.links,
        };
        return result;
    }

    private static async getNode(node: NamedNode | Literal): Promise<NodeElement> {
        let result: NodeElement;
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

    private static async getLink(link: NamedNode): Promise<LinkElement> {
        return (await SparQlGraphParserService.getElementBody(link.value)) as LinkElement;
    }

    private static async getElementBody(str: string): Promise<ElementBody> {
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

    private static async splitStringByCharacter(str: string, character: string): Promise<ElementBody> {
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

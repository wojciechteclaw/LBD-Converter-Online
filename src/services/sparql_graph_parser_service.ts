import { Quad, Literal, NamedNode } from "oxigraph/web";

import { GuidUriService } from "./guid_uri_service";
import { LinkElement } from "@/types/link_element";
import { NodeElement } from "@/types/node_element";
import { ElementBody } from "@/types/element_body";

class SparQlGraphParserService {
    private queryResult: Quad[];
    private nodes = new Map<string, NodeElement>();
    private links: LinkElement[] = [];

    constructor(queryResult: Quad[]) {
        this.queryResult = queryResult;
    }

    public async convertQueryResultToGraphInput(): Promise<any> {
        for (const binding of this.queryResult) {
            let [subject, object] = await Promise.all([
                SparQlGraphParserService.getNode(binding.subject),
                SparQlGraphParserService.getNode(binding.object),
            ]).then((e) => e);
            let link = await SparQlGraphParserService.getLink(binding.predicate).then((link) => link);
            link.source = subject;
            link.target = object;
            this.links.push(link);
            this.nodes.set(binding.subject.value, subject);
            this.nodes.set(binding.object.value, object);
        }
        debugger;
    }

    private static async getNode(node: NamedNode | Literal): Promise<NodeElement> {
        if (node.termType === "NamedNode") {
            return await SparQlGraphParserService.getElementBody(node.value).then((e) => e);
        }
        return {
            id: node.value,
            namespace: "",
        };
    }

    private static async getLink(link: NamedNode): Promise<LinkElement> {
        return (await SparQlGraphParserService.getElementBody(link.value)) as LinkElement;
    }

    private static async getElementBody(str: string): Promise<ElementBody> {
        if (!str.includes("http")) {
            return {
                id: str,
                namespace: "",
            };
        }
        let character = str.includes("#") ? "#" : "/";
        return await SparQlGraphParserService.splitStringByCharacter(str, character);
    }

    private static async splitStringByCharacter(str: string, character: string): Promise<ElementBody> {
        var splitString = str.split(character);
        var firstPart = splitString.slice(0, splitString.length - 1).join(character) + character;
        var lastPart = splitString[splitString.length - 1];
        return {
            id: GuidUriService.decodeURI(lastPart),
            namespace: firstPart,
        };
    }
}

export { SparQlGraphParserService };

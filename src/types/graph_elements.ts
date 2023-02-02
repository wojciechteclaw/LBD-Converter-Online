import { GraphData } from "react-force-graph-2d";
import { LinkElement } from "./link_element";
import { NodeElement } from "./node_element";

interface GraphElements extends GraphData {
    nodes: NodeElement[];
    links: LinkElement[];
}

export { GraphElements };
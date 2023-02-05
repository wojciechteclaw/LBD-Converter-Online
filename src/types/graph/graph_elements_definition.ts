import { ElementsDefinition } from "cytoscape";
import { EdgeElement } from "./edge_element";
import { NodeElement } from "./node_element";

interface GraphElementsDefinition extends ElementsDefinition {
    nodes: NodeElement[];
    edges: EdgeElement[];
}

export { GraphElementsDefinition };

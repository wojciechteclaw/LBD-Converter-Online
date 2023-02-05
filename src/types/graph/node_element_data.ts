import { NodeDataDefinition } from "cytoscape";
import { CustomElementData } from "./custom_element_data";

type NodeElementData = NodeDataDefinition & CustomElementData;

export { NodeElementData };

import { EdgeDataDefinition } from "cytoscape";
import { CustomElementData } from "./custom_element_data";

type EdgeElementData = EdgeDataDefinition & CustomElementData;

export { EdgeElementData };

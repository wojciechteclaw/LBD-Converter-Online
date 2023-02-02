import { LinkObject } from "react-force-graph-2d";
import { ElementBody } from "./element_body";
import { NodeElement } from "./node_element";

type LinkElement = ElementBody & {
        source: NodeElement;
        target: NodeElement;
    } & LinkObject

export { LinkElement };

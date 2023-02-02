import { LinkObject } from "react-force-graph-2d";

type LinkElement = LinkObject &{
    namespace: string;
    element: string;
}

export { LinkElement };
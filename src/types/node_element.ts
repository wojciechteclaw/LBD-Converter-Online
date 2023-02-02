import { NodeObject } from "react-force-graph-2d";

type NodeElement = NodeObject & {
    namespace: string;
    id: string;
};

export { NodeElement };

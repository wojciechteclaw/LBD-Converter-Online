import { FC, useEffect, useRef, useState } from "react";
import Cytoscape, { ElementsDefinition } from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import CytoscapeComponent from "react-cytoscapejs";
import "./Graph.css";

// interface GraphProps {
//     graphData: ElementDefinition[];
// }

const otherElements: Cytoscape.ElementsDefinition = { nodes: [], edges: [] };

const elements: Cytoscape.ElementDefinition[] = [
    { data: { id: "a" } },
    { data: { id: "b" } },
    { data: { id: "ab", label: "sample", source: "a", target: "b" } },
];
const layout = { name: "cose-bilkent", idealEdgeLength: 200 };
Cytoscape.use(COSEBilkent);

const Graph: FC = () => {
    let graphData: Cytoscape.ElementDefinition[] = [];

    return (
        <div id="graph-element">
            <CytoscapeComponent
                elements={elements}
                layout={layout}
                style={{
                    width: "100%",
                    height: "100%",
                    margin: "0px auto",
                    display: "block",
                    backgroundColor: "#ced9d9",
                }}
            />
        </div>
    );
};

export { Graph };

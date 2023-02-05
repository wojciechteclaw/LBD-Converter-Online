import { FC, useEffect, useRef, useState } from "react";
import Cytoscape, { ElementsDefinition } from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import CytoscapeComponent from "react-cytoscapejs";
import "./Graph.css";
import { GraphElementsDefinition } from "@/types/graph/graph_elements_definition";
import { graphLayoutConfiguration } from "./graph_layout_configuration";
import { GraphStylesheet } from "./graph_stylesheet";
import cytoscape from "cytoscape";

interface GraphProps {
    graphElements: GraphElementsDefinition;
}

Cytoscape.use(COSEBilkent);

const Graph: FC<GraphProps> = ({ graphElements }) => {
    const cyRef = useRef<any>();
    const anotherRef = useRef<any>();

    useEffect(() => {
        if (cyRef.current) {
            cyRef.current.layout(graphLayoutConfiguration).run();
            cyRef.current.fit();
        }
        console.log(anotherRef.current)
    }, [graphElements]);

    return (
        <div id="graph-element">
            <CytoscapeComponent
                elements={[...graphElements.nodes, ...graphElements.edges]}
                layout={graphLayoutConfiguration}
                ref={anotherRef}
                style={{
                    width: "100%",
                    height: "100%",
                    margin: "0px auto",
                    display: "block",
                    backgroundColor: "#ced9d9",
                }}
                stylesheet={GraphStylesheet}
                cy={(cy) => (cyRef.current = cy)}
            />
        </div>
    );
};

export { Graph };

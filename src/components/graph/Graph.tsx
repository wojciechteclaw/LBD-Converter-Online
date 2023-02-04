import { FC, useEffect, useRef, useState } from "react";
import Cytoscape, { ElementsDefinition } from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import CytoscapeComponent from "react-cytoscapejs";
import "./Graph.css";
import { GraphElementsDefinition } from "@/types/graph/graph_elements_definition";

interface GraphProps {
    graphElements: GraphElementsDefinition;
}

const layout = { name: "cose-bilkent", idealEdgeLength: 500, label: "data(id)" };
Cytoscape.use(COSEBilkent);

const Graph: FC<GraphProps> = ({ graphElements }) => {
    return (
        <div id="graph-element">
            <CytoscapeComponent
                elements={[...graphElements.nodes, ...graphElements.edges]}
                layout={layout}
                style={{
                    width: "100%",
                    height: "100%",
                    margin: "0px auto",
                    display: "block",
                    backgroundColor: "#ced9d9",
                }}
                cy={(cy) => {
                    cy.on('add', 'node', _evt => {
                    cy.layout(layout).run()
                    cy.fit()
                    })   
                  }}
            />
        </div>
    );
};

export { Graph };

import { FC, useEffect, useRef, MutableRefObject, useState } from "react";
import Cytoscape from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import CytoscapeComponent from "react-cytoscapejs";
import { GraphElementsDefinition } from "@/types/graph/graph_elements_definition";
import { graphLayoutConfiguration } from "./graph_layout_configuration";
import { GraphStylesheet } from "./graph_stylesheet";
import "./Graph.css";

interface GraphProps {
    graphElements: GraphElementsDefinition;
    setCyReference: (ref: MutableRefObject<Cytoscape.Core | undefined>) => void;
}

Cytoscape.use(COSEBilkent);

const Graph: FC<GraphProps> = ({ graphElements, setCyReference }) => {
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [ready, setReady] = useState(false);

    const cyRef = useRef<Cytoscape.Core>();

    useEffect(() => {
        setCyReference(cyRef);
    }, [cyRef]);

    useEffect(() => {
        if (cyRef.current) {
            cyRef.current.layout(graphLayoutConfiguration).run();
            cyRef.current.fit();
        }
    }, [graphElements, ready]);

    return (
        <div id="graph-element" onContextMenu={(e) => console.log(e)}>
            <CytoscapeComponent
                elements={[...graphElements.nodes, ...graphElements.edges]}
                layout={graphLayoutConfiguration}
                style={{
                    width: "100%",
                    height: "100%",
                    margin: "0px auto",
                    display: "block",
                    backgroundColor: "#ced9d9",
                }}
                stylesheet={GraphStylesheet}
                cy={(cy) => {
                    cyRef.current = cy;
                    cy.addListener("tap", "node", (e) => {
                        let selectedNode = e.target.union(e.target.outgoers()).union(e.target.incomers());
                        let currentSelection = cy.nodes(":selected");
                        let selection = currentSelection
                            .union(currentSelection.outgoers())
                            .union(currentSelection.incomers())
                            .union(e.target);
                        let sumSelection = selectedNode.union(selection);
                        cy.elements().difference(sumSelection).addClass("unselected");
                        sumSelection.removeClass("unselected");
                    });
                    cy.addListener("tap", (e) => {
                        if (!e.target.length) {
                            cy.elements().removeClass("unselected");
                        }
                    });
                }}
            />
        </div>
    );
};
// cy.addListener("tap", "node", (e) => {
//     let selectedNode = e.target;
//     console.log(selectedNode);
//     cy.elements().difference(selectedNode.outgoers()).not(selectedNode).addClass("semitransp");
//     selectedNode.addClass("highlight").outgoers().addClass("highlight");
// });
// cy.on("tap", "node", function (e) {
//     var sel = e.target;
//     console.log(sel)
//     cy.elements().difference(sel.outgoers().union(sel.incomers())).not(sel).addClass("semitransp");
//     sel.addClass("highlight").outgoers().union(sel.incomers()).addClass("highlight");
// });
// cy.on("tap", "edge", function (e) {
//     var sel = e.target;
//     // cy.elements().removeClass("semitransp");
//     // sel.removeClass("highlight").outgoers().union(sel.incomers()).removeClass("highlight");
//     cy.elements().difference(sel.outgoers().union(sel.incomers())).not(sel).addClass("semitransp");
//     sel.addClass("highlight").outgoers().union(sel.incomers()).addClass("highlight");
// });

export { Graph };

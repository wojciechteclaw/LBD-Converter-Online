import { FC, useEffect, useRef, MutableRefObject } from "react";
import Cytoscape from "cytoscape";
import COSEBilkent from "cytoscape-cose-bilkent";
import dblclick from "cytoscape-dblclick";
import CytoscapeComponent from "react-cytoscapejs";
import { GraphElementsDefinition } from "@/types/graph/graph_elements_definition";
import { graphLayoutConfiguration } from "./graph_layout_configuration";
import { GraphStylesheet } from "./graph_stylesheet";
import "./Graph.css";
import { SparQlGraphParserService } from "@services/sparql_graph_parser_service";
import { dbDataController } from "@services/dependency_injection";

interface GraphProps {
    graphElements: GraphElementsDefinition;
    setCyReference: (ref: MutableRefObject<Cytoscape.Core | undefined>) => void;
}

Cytoscape.use(COSEBilkent);
Cytoscape.use(dblclick);

const Graph: FC<GraphProps> = ({ graphElements, setCyReference }) => {
    const cyRef = useRef<Cytoscape.Core>();

    useEffect(() => {
        setCyReference(cyRef);
    }, [cyRef]);

    useEffect(() => {
        if (cyRef.current) {
            cyRef.current.layout(graphLayoutConfiguration).run();
            cyRef.current.fit();
        }
    }, [graphElements]);

    const getNodeAdjacentElements = (id: string) => {
        let result: Cytoscape.ElementsDefinition = { nodes: [], edges: [] };
        const NODE_QUERY = `CONSTRUCT
        {?s ?p ?o}
        WHERE { 
            ?s ?p ?o .
        FILTER(?s = <${id}> || ?o = <${id}>)
        }
        `;
        let query_result = dbDataController.query(NODE_QUERY);
        if (query_result) {
            let parser = new SparQlGraphParserService(query_result);
            result = parser.convertQueryResultToGraphInput();
        }
        return result;
    };

    const onNodeClick = (cy: Cytoscape.Core, e: Cytoscape.EventObject) => {
        let selectedNode = e.target.union(e.target.outgoers()).union(e.target.incomers());
        let currentSelection = cy.nodes(":selected");
        let selection = currentSelection
            .union(currentSelection.outgoers())
            .union(currentSelection.incomers())
            .union(e.target);
        let sumSelection = selectedNode.union(selection);
        cy.elements().difference(sumSelection).addClass("unselected").removeClass("invisible");
        sumSelection.removeClass("unselected").removeClass("invisible");
    };

    const onDblClick = (cy: Cytoscape.Core, e: Cytoscape.EventObject) => {
        let newElementsDefinition = getNodeAdjacentElements(e.target.id());
        if (newElementsDefinition.nodes.length > 0) {
            let currentlyExistingNodes = cy.nodes();
            let graphNodes = cy.nodes().map((node) => node.id());
            let allObjectsToAdd = cy.add(newElementsDefinition);
            currentlyExistingNodes.lock();
            let result = allObjectsToAdd
                .edges()
                .filter(
                    (edge, _) => !(graphNodes.includes(edge.source().id()) && graphNodes.includes(edge.target().id()))
                );
            cy.zoomingEnabled(false);
            result.length > 0 ? cy.layout(graphLayoutConfiguration).run() : null;
            cy.zoomingEnabled(true);
            currentlyExistingNodes.unlock();
        }
    };

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
                    cy.dblclick();
                    cy.addListener("dblclick", "node", (e) => onDblClick(cy, e));
                    cy.addListener("tap", "node", (e) => onNodeClick(cy, e));
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

export { Graph };

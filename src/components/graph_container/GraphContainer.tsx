import { FC, useEffect, useState, MutableRefObject } from "react";
import Cytoscape from "cytoscape";
import { Graph } from "@components/graph/Graph";
import { GraphMenu } from "@components/graph_menu/GraphMenu";
import { SparQlQuery } from "@components/sparql_query/SparQlQuery";
import { dbDataController } from "@services/dependency_injection";
import { SparQlGraphParserService } from "@services/sparql_graph_parser_service";
import { GraphElementsDefinition } from "@/types/graph/graph_elements_definition";
import "./GraphContainer.css";
import { ExportStyleSheet, GraphStylesheet } from "../graph/graph_stylesheet";

const GraphContainer: FC = () => {
    const [queryString, setQueryString] = useState<string>("");
    const [graphElements, setGraphElements] = useState<GraphElementsDefinition>({ nodes: [], edges: [] });
    const [cyReference, setCyReference] = useState<MutableRefObject<Cytoscape.Core | undefined>>();

    useEffect(() => {
        (async () => {
            return await fetch("./samples/example_data.json")
                .then((e) => e.json())
                .then((e) => setGraphElements(e));
        })();
    }, []);

    const fetchGraphData = async () => {
        const result = dbDataController.query(queryString);
        if (result) {
            let parser = new SparQlGraphParserService(result);
            let results = parser.convertQueryResultToGraphInput();
            setGraphElements(results);
        }
    };

    const onGraphPngDownload = () => {
        cyReference!.current!.style(ExportStyleSheet)
        let text = cyReference!.current!.png({ full: true, scale: 2, output: "blob" });
        cyReference!.current!.style(GraphStylesheet)
        const a = document.createElement("a");
        a.download = "lbd-converter-graph.png";
        a.href = URL.createObjectURL(text);
        a.dataset.downloadurl = [a.download, a.href].join(":");
        a.style.display = "none";
        a.click();
        setTimeout(() => {
            a.remove();
        }, 100);
    };

    useEffect(() => {
        if (queryString === "") return;
        fetchGraphData();
    }, [queryString]);

    return (
        <div id="graph-container-center">
            <div id="graph-container-container">
                <div id="graph-container-title">
                    <p id="graph-container-title-content">graph visualization</p>
                </div>
                <div id="graph-container-graph">
                    <Graph graphElements={graphElements} setCyReference={setCyReference} />
                </div>
                <div id="graph-container-sparql-wrapper" style={{ borderLeft: "1px solid #618685" }}>
                    <SparQlQuery queryString={queryString} onQueryStringChange={setQueryString} />
                </div>
                <GraphMenu onGraphPngDownload={onGraphPngDownload} />
            </div>
        </div>
    );
};

export { GraphContainer };

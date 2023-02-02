import { FC, useState } from "react";
import { Graph } from "@components/graph/Graph";
import { GraphMenu } from "@components/graph_menu/GraphMenu";
import "./GraphContainer.css";
import { SparQlQuery } from "../sparql_query/SparQlQuery";

const GraphContainer: FC = () => {
    const DEFAULT_QUERY = `PREFIX bot: <https://w3id.org/bot#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
SELECT ?element ?p ?object
WHERE {
    ?element a bot:Space .
    ?element ?p ?object .
    FILTER (
        strstarts(str(?p), "https://w3id.org/bot#") ||
        strstarts(str(?p), "http://www.w3.org/2002/07/owl#")
    )
}`;

    const [queryString, setQueryString] = useState<string>(DEFAULT_QUERY);
    const [graphData, setGraphData] = useState<any>(null);

    return (
        <div id="graph-container-container">
            <div id="graph-container-title">
                <p>graph visualizer</p>
            </div>
            <div id="graph-container-graph">
                <Graph />
                <SparQlQuery queryString={queryString} onQueryStringChange={setQueryString} />
            </div>
            <GraphMenu />
        </div>
    );
};

export { GraphContainer };

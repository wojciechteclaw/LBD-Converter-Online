import { FC, useEffect, useState } from "react";
import { Graph } from "@components/graph/Graph";
import { GraphMenu } from "@components/graph_menu/GraphMenu";
import "./GraphContainer.css";
import { SparQlQuery } from "../sparql_query/SparQlQuery";
import { dbDataController } from "@services/dependency_injection";

const GraphContainer: FC = () => {
    const [queryString, setQueryString] = useState<string>("");
    const [graphData, setGraphData] = useState<any>(null);

    useEffect(() => {
        if (queryString === "") return;
        console.log(`query database with: ${queryString}`);
        let result = dbDataController.query(queryString);
        console.log(result);
    }, [queryString]);

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

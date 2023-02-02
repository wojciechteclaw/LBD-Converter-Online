import { FC, useCallback, useEffect, useState } from "react";
import { Graph } from "@components/graph/Graph";
import { GraphMenu } from "@components/graph_menu/GraphMenu";
import "./GraphContainer.css";
import { SparQlQuery } from "../sparql_query/SparQlQuery";
import { dbDataController } from "@services/dependency_injection";
import { SparQlGraphParserService } from "@services/sparql_graph_parser_service";

const GraphContainer: FC = () => {
    const [queryString, setQueryString] = useState<string>("");
    const [graphData, setGraphData] = useState<any>(null);

    const fetchGraphData = async () => {
        const result = await dbDataController
            .query(queryString)
            .then((e) => e)
            .catch((e) => console.log(e));
        if (result) {
            let parser = new SparQlGraphParserService(result);
            parser.convertQueryResultToGraphInput();
        }
    };

    useEffect(() => {
        if (queryString === "") return;
        fetchGraphData();
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

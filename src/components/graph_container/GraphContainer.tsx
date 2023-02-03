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
            let results = await parser.convertQueryResultToGraphInput().then((e) => e);
            setGraphData(results);
        }
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
                    <Graph graphData={graphData} />
                </div>
                <div id="graph-container-sparql-wrapper" style={{borderLeft: "1px solid #618685"}}>
                    <SparQlQuery queryString={queryString} onQueryStringChange={setQueryString} />
                </div>

                <GraphMenu />
            </div>
        </div>
    );
};

export { GraphContainer };

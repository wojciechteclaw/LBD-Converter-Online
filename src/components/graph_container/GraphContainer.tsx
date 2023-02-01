import { FC } from "react";
import { Graph } from "@components/graph/Graph";
import { GraphMenu } from "@components/graph_menu/GraphMenu";
import "./GraphContainer.css";

const GraphContainer: FC = () => {
    return (
        <div id="graph-container-container">
            <div id="graph-container-title">
                <p>graph visualizer</p>
            </div>
            <div id="graph-container-graph">
                <Graph />
            </div>
            <GraphMenu />
        </div>
    );
};

export { GraphContainer };

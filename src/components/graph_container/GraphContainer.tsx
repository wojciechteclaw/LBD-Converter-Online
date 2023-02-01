import { FC } from "react";
import "./GraphContainer.css";

const GraphContainer: FC = () => {
    return (
        <div id="graph-container-container">
            <div id="graph-container-title">
                <p>graph visualizer</p>
            </div>
            <div id="graph-container-graph">Graph</div>
            <div id="graph-container-bottom-menu"></div>
        </div>
    );
};

export { GraphContainer };

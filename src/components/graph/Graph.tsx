import { NodeElement } from "@/types/node_element";
import { FC, useEffect, useRef, useState } from "react";
import ForceGraph2D, { GraphData } from "react-force-graph-2d";
import "./Graph.css";

interface GraphProps {
    graphData: GraphData;
}

const Graph: FC<GraphProps> = ({ graphData }) => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [exampleData, setExampleData] = useState<GraphData>({ nodes: [], links: [] });
    const forceGraphRef = useRef();

    const handleResize = () => {
        setWidth((document.querySelector("#graph-container-graph") as HTMLElement).clientWidth * 0.75);
        setHeight((document.querySelector("#graph-container-graph") as HTMLElement).clientHeight);
    };

    useEffect(() => {
        (async () => {
            return await fetch("./samples/example_data.json")
                .then((e) => e.json())
                .then((e) => {
                    setExampleData(e);
                });
        })();
    }, []);

    useEffect(() => {
        handleResize();
    }, [forceGraphRef]);

    window.addEventListener("resize", handleResize, false);

    return (
        <div id="graph-element">
            <ForceGraph2D
                ref={forceGraphRef}
                width={width}
                height={height}
                backgroundColor="#ced9d9"
                graphData={graphData ? graphData : exampleData}
                linkCurvature="curvature"
                linkDirectionalArrowLength={0.2}
                linkDirectionalArrowRelPos={0.9}
                nodeLabel="body"
                autoPauseRedraw={false}
                // onLinkHover={(link: LinkObject) => {
                //     // ctx.
                // }}
                // // linkLabel={(link: LinkObject) => `${link.source!.id} to ${link.target!.id}`}
                // // linkColor={(link: LinkObject) => (parseInt(link.source!.id) > 5 ? "red" : "blue")}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    let nodeElement = node as NodeElement;
                    const label = nodeElement.body;
                    const fontSize = 10 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.fillStyle = nodeElement.color ? nodeElement.color : "green";
                    ctx.beginPath();
                    ctx.arc(node.x as number, node.y as number, 20 / globalScale, 0, 2 * Math.PI, false);
                    ctx.fill();
                    ctx.fillStyle = "white";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(label as string, node.x as number, node.y as number);
                }}
            />
        </div>
    );
};

export { Graph };

import { LinkElement } from "@/types/link_element";
import { NodeElement } from "@/types/node_element";
import { FC, useEffect, useRef, useState } from "react";
import ForceGraph2D, { GraphData, NodeObject } from "react-force-graph-2d";
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
        setWidth((document.querySelector("#graph-container-graph") as HTMLElement).clientWidth);
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

    const onNodeCanvasObject = (node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
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
    };

    window.addEventListener("resize", handleResize, false);

    return (
        <>
            <ForceGraph2D
                ref={forceGraphRef}
                width={width}
                height={height}
                backgroundColor="#ced9d9"
                graphData={graphData ? graphData : exampleData}
                linkCurvature="curvature"
                linkDirectionalArrowLength={1}
                linkDirectionalArrowRelPos={0.93}
                nodeLabel={(node) => {
                    let nodeElement = node as NodeElement;
                    return nodeElement.namespace + nodeElement.body;
                }}
                autoPauseRedraw={false}
                cooldownTime={2000}
                onNodeDragEnd={(node) => {
                    node.fx = node.x;
                    node.fy = node.y;
                }}
                onNodeRightClick={(node, event) => {}}
                onNodeClick={(node, event) => {}}
                warmupTicks={100}
                nodeCanvasObject={onNodeCanvasObject}
            />
        </>
    );
};

export { Graph };

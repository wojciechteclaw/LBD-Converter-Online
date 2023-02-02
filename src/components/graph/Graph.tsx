import { FC, useEffect, useRef, useState } from "react";
import ForceGraph2D, { LinkObject } from "react-force-graph-2d";
import { exampleData } from "./exampleData";
import "./Graph.css";

const Graph: FC = () => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const forceGraphRef = useRef();

    const handleResize = () => {
        setWidth((document.querySelector("#graph-container-graph") as HTMLElement).clientWidth * 0.75);
        setHeight((document.querySelector("#graph-container-graph") as HTMLElement).clientHeight);
    };

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
                graphData={exampleData}
                linkCurvature="curvature"
                linkDirectionalArrowLength={5}
                linkDirectionalArrowRelPos={0.9}
                nodeLabel="id"
                autoPauseRedraw={false}
                onLinkHover={(link: LinkObject) => {
                    console.log(link);
                }}
                // linkLabel={(link: LinkObject) => `${link.source!.id} to ${link.target!.id}`}
                // linkColor={(link: LinkObject) => (parseInt(link.source!.id) > 5 ? "red" : "blue")}
                nodeCanvasObject={(node, ctx, globalScale) => {
                    const label = node.id;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Sans-Serif`;
                    ctx.fillStyle = "green";
                    ctx.beginPath();
                    ctx.arc(node.x as number, node.y as number, 25 / globalScale, 0, 2 * Math.PI, false);
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

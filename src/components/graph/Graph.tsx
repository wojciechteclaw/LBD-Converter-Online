import { FC, useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D, { ForceGraphProps } from "react-force-graph-2d";
import { exampleData } from "./exampleData";

const Graph: FC = () => {
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const forceGraphRef = useRef();

    useEffect(() => {
        setWidth((document.querySelector("#graph-container-graph") as HTMLElement).clientWidth);
        setHeight((document.querySelector("#graph-container-graph") as HTMLElement).clientHeight);
    }, []);

    

    return (
        <>
            <ForceGraph2D
                ref={forceGraphRef}
                width={width}
                height={height}
                backgroundColor="#ced9d9"
                graphData={exampleData}
                linkCurvature="curvature"
            />
        </>
    );
};

export { Graph };

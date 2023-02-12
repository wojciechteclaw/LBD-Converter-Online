const GraphStylesheet: Array<cytoscape.Stylesheet> = [
    {
        selector: "node",
        style: {
            "background-color": "data(color)",
            label: "data(label)",
            "padding-top": "4",
            "padding-bottom": "4",
            "font-size": "12",
            "background-fit": "cover",
            width: 40,
            height: 40,
        },
    },
    {
        selector: "node[label]",
        style: {
            label: "data(label)",
            "font-size": "12",
            "text-halign": "center",
            "text-valign": "center",
            color: "#455C5C",
            "text-margin-y": 37,
            "text-background-color": "#ced9d9",
            "text-background-padding": "4px",
            "text-background-opacity": 1,
        },
    },
    {
        selector: "edge",
        style: {
            "curve-style": "unbundled-bezier",
            "control-point-step-size": 50,
            "target-arrow-shape": "triangle",
            "padding-bottom": "4",
            width: 1,
            "text-rotation": "autorotate",
            "control-point-distances": "25",
            "line-color": "#618685",
            "target-arrow-color": "#618685",
        },
    },
    {
        selector: "edge[label]",
        style: {
            label: "data(label)",
            "font-size": "12",
            "text-background-opacity": 1,
            color: "#455C5C",
            "text-background-color": "#ced9d9",
        },
    },
    {
        selector: "node.unselected",
        style: { "background-opacity": 0.1, "text-opacity": 0.1, "text-background-opacity": 0 },
    },
    {
        selector: "edge.unselected",
        style: { "background-opacity": 0.1, "line-opacity": 0.1, "text-opacity": 0.1, "text-background-opacity": 0 },
    },
    {
        selector: "node.highlighted",
        style: {
            backgroundColor: "#F5A623",
            "background-opacity": 1,
            "text-opacity": 1,
            "text-background-opacity": 1,
        },
    },
    {
        selector: "edge.highlighted",
        style: {
            "line-color": "#F5A623",
            "target-arrow-color": "#F5A623",
            "background-opacity": 1,
            "line-opacity": 1,
            "text-opacity": 1,
            "text-background-opacity": 1,
        },
    },
];

const ExportStyleSheet: Array<cytoscape.Stylesheet> = [
    {
        selector: "node",
        style: {
            "background-color": "data(color)",
            label: "data(label)",
            "padding-top": "4",
            "padding-bottom": "4",
            "font-size": "12",
            "background-fit": "cover",
            width: 40,
            height: 40,
        },
    },
    {
        selector: "node[label]",
        style: {
            label: "data(label)",
            "font-size": "12",
            "text-halign": "center",
            "text-valign": "center",
            color: "black",
            "text-margin-y": 37,
            "text-background-color": "white",
            "text-background-padding": "4px",
            "text-background-opacity": 1,
        },
    },
    {
        selector: "edge",
        style: {
            "curve-style": "unbundled-bezier",
            "control-point-step-size": 50,
            "target-arrow-shape": "triangle",
            "padding-bottom": "4",
            width: 1,
            "text-rotation": "autorotate",
            "control-point-distances": "25",
            "line-color": "black",
            "target-arrow-color": "black",
        },
    },
    {
        selector: "edge[label]",
        style: {
            label: "data(label)",
            "font-size": "12",
            "text-background-opacity": 1,
            color: "black",
            "text-background-color": "white",
        },
    },
    {
        selector: "node.unselected",
        style: { "background-opacity": 0.1, "text-opacity": 0.1, "text-background-opacity": 0 },
    },
    {
        selector: "edge.unselected",
        style: { "background-opacity": 0.1, "line-opacity": 0.1, "text-opacity": 0.1, "text-background-opacity": 0 },
    },
];

export { GraphStylesheet, ExportStyleSheet };

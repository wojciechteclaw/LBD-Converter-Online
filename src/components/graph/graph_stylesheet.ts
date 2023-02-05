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
            width: 50,
            height: 50,
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
            "padding-left": "4",
            "padding-right": "4",
            "text-margin-y": 37,
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
];

export { GraphStylesheet };

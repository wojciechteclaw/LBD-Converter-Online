import { FC, useState } from "react";
import Cytoscape from "cytoscape";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { SubmitSparQL } from "@components/buttons/submit_sparql/SubmitSparQL";
import "./SparQlQuery.css";

interface SparQlQueryProps {
    onSubmit: (query: string) => void;
}

const PLACEHOLDER_VALUE = `Enter SPARQL query here:

!Remember to use CONSTRUCT QUERY!

CONSTRUCT
{ ?s ?p ?o }
WHERE {
?s ?p ?o .
}`;

const SparQlQuery: FC<SparQlQueryProps> = ({ onSubmit }) => {
    const [query, setQuery] = useState<string>("");

    return (
        <div id="spar-ql-editor" style={{ height: "100%" }}>
            <CodeEditor
                value={query}
                language="sparql"
                onChange={(e) => setQuery(e.target.value)}
                placeholder={PLACEHOLDER_VALUE}
                padding={10}
                style={{
                    height: "100%",
                    width: "100%",
                    float: "left",
                    backgroundColor: "#ced9d9",
                    fontSize: "16px",
                    fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
                }}
            />
            <SubmitSparQL onClick={() => onSubmit(query)} />
        </div>
    );
};

export { SparQlQuery };

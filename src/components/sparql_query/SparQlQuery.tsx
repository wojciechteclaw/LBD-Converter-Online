import { FC, useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { SubmitSparQL } from "@components/buttons/submit_sparql/SubmitSparQL";

interface SparQlQueryProps {
    queryString: string;
    onQueryStringChange: (queryString: string) => void;
}

const SparQlQuery: FC<SparQlQueryProps> = ({ queryString, onQueryStringChange }) => {
    return (
        <div
            id="sparQlEditor"
            style={{
                display: "block",
                width: "24.9%",
                height: "100%",
                border: "none",
                borderLeft: "1px solid #618685",
                float: "left",
            }}
        >
            <CodeEditor
                value={queryString}
                language="sparql"
                onChange={(e) => onQueryStringChange(e.target.value)}
                placeholder="Enter SPARQL query here"
                padding={10}
                style={{
                    height: "90%",
                    width: "100%",
                    float: "left",
                    backgroundColor: "#ced9d9",
                    fontSize: "16px",
                    fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
                }}
                data-color-mode="light"
            />
            <SubmitSparQL />
        </div>
    );
};

export { SparQlQuery };

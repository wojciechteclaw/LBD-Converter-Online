import { FC, useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { SubmitSparQL } from "@components/buttons/submit_sparql/SubmitSparQL";

interface SparQlQueryProps {
    queryString: string;
    onQueryStringChange: (queryString: string) => void;
}

const SparQlQuery: FC<SparQlQueryProps> = ({ queryString, onQueryStringChange }) => {
    const [query, setQuery] = useState<string>(queryString);
    const onButtonClick = () => {
        onQueryStringChange(query);
    };

    const PLACEHOLDER_VALUE = `Enter SPARQL query here:

!Remember to use CONSTRUCT QUERY!

CONSTRUCT 
WHERE {
    ?s ?p ?o
}`;

    return (
        <div id="sparQlEditor" style={{height:"100%"}}>
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
                data-color-mode="light"
            />
            <SubmitSparQL onClick={onButtonClick} />
        </div>
    );
};

export { SparQlQuery };

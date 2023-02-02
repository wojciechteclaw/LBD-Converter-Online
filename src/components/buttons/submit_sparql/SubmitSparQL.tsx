import { FC } from "react";
import "./SubmitSparQL.css";

const SubmitSparQL: FC = () => {
    return (
        <>
            <button
                id="submit-spar-ql"
                className="positive ui button"
                style={{ width: "80%", padding: "3%", backgroundColor: "#618685" }}
            >
                Submit query
            </button>
        </>
    );
};

export { SubmitSparQL };

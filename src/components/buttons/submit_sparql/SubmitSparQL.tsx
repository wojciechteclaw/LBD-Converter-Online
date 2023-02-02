import { FC } from "react";
import "./SubmitSparQL.css";

interface SubmitSparQLProps {
    onClick: () => void;
}

const SubmitSparQL: FC<SubmitSparQLProps> = ({onClick}) => {
    return (
        <>
            <button
                onClick={onClick}
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

import { FC, useContext } from "react";
import "./MergeFilesButton.css";

interface MergeFilesButtonProps {
    onClick: () => void;
}

const MergeFilesButton: FC<MergeFilesButtonProps> = ({ onClick }) => {
    return (
        <div className="merge-files-container" onClick={onClick}>
            <p style={{ textAlign: "center" }}>Load and merge</p>
        </div>
    );
};

export { MergeFilesButton };

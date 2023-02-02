import { FC } from "react";
import "./MergeFilesButton.css";

interface MergeFilesButtonProps {
    onClick: () => void;
}

const MergeFilesButton: FC<MergeFilesButtonProps> = ({ onClick }) => {
    return (
        <div className="merge-files-container">
            <div className="merge-button" onClick={onClick}>Load and merge</div>
        </div>
    );
};

export { MergeFilesButton };

import { FC } from "react";
import "./MergeFilesButton.css";

interface MergeFilesButtonProps {
    onClick: () => void;
}

const MergeFilesButton: FC<MergeFilesButtonProps> = ({ onClick }) => {
    return (
        <div className="merge-files-container">
            <p>Load and merge</p>
        </div>
    );
};

export { MergeFilesButton };

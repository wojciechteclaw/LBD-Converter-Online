import { FC } from "react";
import "./LoadedFile.css";

interface LoadedFileProps {
    fileName: string;
    onEditModalToggle: () => void;
    onRemoveModalToggle: () => void;
}

const LoadedFile: FC<LoadedFileProps> = ({ fileName, onEditModalToggle, onRemoveModalToggle }) => {
    return (
        <div className="ifc-file-container">
            <p className="ifc-file-name">{fileName}</p>
            <i className="edit icon ifc-file-edit-button" onClick={onEditModalToggle}></i>
            <i className="trash icon ifc-file-edit-button" onClick={onRemoveModalToggle}></i>
        </div>
    );
};

export { LoadedFile };

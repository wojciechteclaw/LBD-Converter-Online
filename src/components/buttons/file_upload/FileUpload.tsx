import { FC } from "react";
import "./FileUpload.css";

interface FileUploadProps {
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload: FC<FileUploadProps> = ({ onFileUpload }) => {
    return (
        <div className="file-upload-container">
            <input
                type="file"
                id="file-upload"
                onChange={onFileUpload}
                style={{ display: "none" }}
                multiple={true}
                accept=".ifc"
            />
            <label htmlFor="file-upload" className="green-button">
                <p>Upload IFC File</p>
            </label>
        </div>
    );
};

export { FileUpload };

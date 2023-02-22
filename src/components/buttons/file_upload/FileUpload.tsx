import { FC, useRef } from "react";
import "./FileUpload.css";

interface FileUploadProps {
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload: FC<FileUploadProps> = ({ onFileUpload }) => {
    const inputElement = useRef<HTMLInputElement>(null);

    const onClick = () => {
        inputElement.current!.click();
    };

    return (
        <div className="file-upload-container" onClick={onClick}>
            <input
                type="file"
                id="file-upload"
                onChange={onFileUpload}
                style={{ display: "none" }}
                multiple={true}
                accept=".ifc"
                ref={inputElement}
            />
            <p className="file-upload-button-title">Upload IFC File</p>
        </div>
    );
};

export { FileUpload };

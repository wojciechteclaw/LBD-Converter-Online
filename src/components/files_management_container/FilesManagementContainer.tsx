import { FC, useEffect, useState } from "react";
import { FileUpload } from "@components/buttons/file_upload/FileUpload";
import "./FilesManagementContainer.css";
import { IfcFile } from "../ifc_file/IfcFile";
import { ParserSettings, SerializationFormat } from "ifc-lbd";
import { MergeFilesButton } from "../buttons/convert_files/MergeFilesButton";

const FilesManagementContainer: FC = () => {
    const [loadedFiles, setLoadedFiles] = useState<File[]>([]); // [

    const onFileLoad = (e) => {
        const newFiles = new Array<File>();
        if (e.target.files != null) {
            if (e.target.files.length > 1) {
                for (let i = 0; i < e.target.files.length; i++) {
                    newFiles.push(e.target.files[i] as File);
                }
            } else {
                newFiles.push(e.target.files[0] as File);
            }
            setLoadedFiles([...loadedFiles, ...newFiles]);
        }
    };

    const defaultParserSettings: ParserSettings = {
        namespace: "http://www.w3.org/2000/svg",
        subsets: {
            BOT: false,
            FSO: false,
            PRODUCTS: false,
            PROPERTIES: false,
        },
        outputFormat: SerializationFormat.NQuads,
        normalizeToSIUnits: true,
        verbose: true,
    };

    const onRemoveFile = (fileIndex: number) => {
        setLoadedFiles(loadedFiles.filter((_, index) => index !== fileIndex));
    };

    const mergeFiles = () => {
        console.log("merginig files");
    };

    return (
        <div id="file-management-container">
            <FileUpload onFileUpload={onFileLoad} />
            <div className="file-management-ifc-files-wrapper">
                {loadedFiles.map((file, index) => {
                    return (
                        <IfcFile
                            key={index}
                            fileName={file.name}
                            index={index}
                            parserSettings={defaultParserSettings}
                            onRemoveFile={onRemoveFile}
                        />
                    );
                })}
            </div>
            <MergeFilesButton onClick={mergeFiles} />
        </div>
    );
};

export { FilesManagementContainer };

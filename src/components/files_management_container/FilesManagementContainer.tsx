import { FC, useEffect, useState } from "react";
import { FileUpload } from "@components/buttons/file_upload/FileUpload";
import "./FilesManagementContainer.css";
import { LoadedFile } from "../loaded_file/LoadedFile";
import { MergeFilesButton } from "../buttons/convert_files/MergeFilesButton";
import { filesService } from "@services/dependency_injection";
import { ParserSettings } from "ifc-lbd";

const FilesManagementContainer: FC = () => {
    const [loadedFileComponents, setLoadedFileComponents] = useState<JSX.Element[]>([]);

    const onFileLoad = (e) => {
        if (e.target.files != null) {
            if (e.target.files.length > 1) {
                for (let i = 0; i < e.target.files.length; i++) {
                    filesService.addFile(e.target.files[i] as File);
                }
            } else {
                filesService.addFile(e.target.files[0] as File);
            }
            generateLoadedFileComponents();
        }
    };

    const generateLoadedFileComponents = () => {
        const newComponents = filesService.getAllFileObjects().map((parsingObject, fileIndex) => {
            return (
                <LoadedFile
                    key={fileIndex}
                    fileName={parsingObject.file.name}
                    index={fileIndex}
                    onRemoveFile={() => filesService.removeFile(fileIndex)}
                />
            );
        });
        setLoadedFileComponents(newComponents);
    };

    const mergeFiles = () => {
        console.log("merginig files");
    };

    return (
        <div id="file-management-container">
            <FileUpload onFileUpload={onFileLoad} />
            <div className="file-management-ifc-files-wrapper">{loadedFileComponents}</div>
            <MergeFilesButton onClick={mergeFiles} />
        </div>
    );
};

export { FilesManagementContainer };

import { FC, useState } from "react";
import { FileUpload } from "@components/buttons/file_upload/FileUpload";
import { LoadedFile } from "@components/loaded_file/LoadedFile";
import { MergeFilesButton } from "@components/buttons/merge_files/MergeFilesButton";
import { dbDataController, filesService, ifcManagerService } from "@services/dependency_injection";
import "./FilesManagementContainer.css";

const FilesManagementContainer: FC = () => {
    const [loadedFileComponents, setLoadedFileComponents] = useState<JSX.Element[]>([]);

    const onFileLoad = async (e) => {
        if (e.target.files.length === 0) return;
        let files = e.target.files as File[];
        for (let file of files) {
            await filesService.addFile(file);
        }
        generateLoadedFileComponents();
    };

    const onRemoveFile = (index: number) => {
        filesService.removeFile(index);
        generateLoadedFileComponents();
    };

    const generateLoadedFileComponents = () => {
        const newComponents = filesService.getAllFileObjects().map((parsingObject, fileIndex) => {
            return (
                <LoadedFile
                    key={fileIndex}
                    fileName={parsingObject.fileName}
                    index={parsingObject.modelID}
                    onRemoveFile={onRemoveFile}
                />
            );
        });
        setLoadedFileComponents(newComponents);
    };

    const mergeFiles = async () => {
        dbDataController.clearStore();
        ifcManagerService.mergeFiles();
    };

    return (
        <div id="file-management-container">
            <FileUpload onFileUpload={async (e) => onFileLoad(e)} />
            <div className="file-management-ifc-files-wrapper">{loadedFileComponents}</div>
            <MergeFilesButton onClick={async () => await mergeFiles()} />
        </div>
    );
};

export { FilesManagementContainer };

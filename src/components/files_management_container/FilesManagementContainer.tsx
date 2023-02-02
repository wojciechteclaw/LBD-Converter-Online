import { FC, useState } from "react";
import { FileUpload } from "@components/buttons/file_upload/FileUpload";
import "./FilesManagementContainer.css";
import { LoadedFile } from "../loaded_file/LoadedFile";
import { MergeFilesButton } from "../buttons/merge_files/MergeFilesButton";
import { dbDataController, filesService, ifcManagerService } from "@services/dependency_injection";

const FilesManagementContainer: FC = () => {
    const [loadedFileComponents, setLoadedFileComponents] = useState<JSX.Element[]>([]);

    const onFileLoad = async (e) => {
        if (e.target.files.length === 0) return;
        let files = e.target.files as File[];
        for (let i = 0; i < files.length; i++) {
            await filesService.addFile(files[i]);
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
        await ifcManagerService.mergeFiles().then((e) => e);
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

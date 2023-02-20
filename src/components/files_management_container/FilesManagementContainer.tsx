import { FC, useState } from "react";
import { FileUpload } from "@components/buttons/file_upload/FileUpload";
import { LoadedFile } from "@components/loaded_file/LoadedFile";
import { MergeFilesButton } from "@components/buttons/merge_files/MergeFilesButton";
import { dbDataController, filesService, ifcManagerService } from "@services/dependency_injection";
import "./FilesManagementContainer.css";
import { ParsingObject } from "@/types/parsing_object";
import RemoveModal from "../remove_modal/RemoveModal";
import { EditModal } from "../edit_modal/EditModal";
import { useModal } from "@hooks/useModal";

const FilesManagementContainer: FC = () => {
    const [loadedFileComponents, setLoadedFileComponents] = useState<ParsingObject[]>([]);
    const [activeFile, setActiveFile] = useState<ParsingObject | null>(null);
    const editModal = useModal(false);
    const removeModal = useModal(false);

    const onFileLoad = async (e) => {
        if (e.target.files.length === 0) return;
        let files = e.target.files as File[];
        for (let file of files) {
            await filesService.addFile(file);
        }
        generateLoadedFileComponents();
    };

    const onRemoveFile = () => {
        if (!activeFile) return;
        filesService.removeFile(activeFile.modelID);
        generateLoadedFileComponents();
    };

    const generateLoadedFileComponents = () => {
        const newComponents = filesService.getAllFileObjects();
        setLoadedFileComponents([...newComponents]);
    };

    const mergeFiles = async () => {
        dbDataController.clearStore();
        ifcManagerService.mergeFiles();
    };

    return (
        <aside id="file-management-container">
            <FileUpload onFileUpload={onFileLoad} />
            <div className="file-management-ifc-files-wrapper">
                {loadedFileComponents.map((parsingObject, index) => {
                    return (
                        <LoadedFile
                            key={index}
                            fileName={parsingObject.fileName}
                            onEditModalToggle={() => {
                                editModal.toggle();
                                setActiveFile(parsingObject);
                            }}
                            onRemoveModalToggle={() => {
                                removeModal.toggle();
                                setActiveFile(parsingObject);
                            }}
                        />
                    );
                })}
            </div>
            <MergeFilesButton onClick={mergeFiles} />
            <EditModal activeFile={activeFile} isOpen={editModal.isOpen} toggle={editModal.toggle} />
            <RemoveModal
                activeFile={activeFile}
                isOpen={removeModal.isOpen}
                onRemoveFile={onRemoveFile}
                toggle={removeModal.toggle}
            />
        </aside>
    );
};

export { FilesManagementContainer };

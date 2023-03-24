import { FC, useState } from "react";
import { FileUpload } from "@components/buttons/file_upload/FileUpload";
import { LoadedFile } from "@components/loaded_file/LoadedFile";
import { MergeFilesButton } from "@components/buttons/merge_files/MergeFilesButton";
import { filesService } from "@services/dependency_injection";
import "./FilesManagementContainer.css";
import RemoveModal from "../remove_modal/RemoveModal";
import { EditModal } from "../edit_modal/EditModal";
import { useModal } from "@hooks/useModal";
import { IfcModel } from "@/types/ifc_model";

const FilesManagementContainer: FC = () => {
    const [loadedFileComponents, setLoadedFileComponents] = useState<IfcModel[]>([]);
    const [activeFile, setActiveFile] = useState<IfcModel | null>(null);
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
        filesService.removeModel(activeFile.id);
        generateLoadedFileComponents();
    };

    const generateLoadedFileComponents = () => {
        const newComponents = filesService.getAllModels();
        setLoadedFileComponents([...newComponents]);
    };

    const mergeFiles = async () => {
        await filesService.mergeFiles();
    };

    return (
        <aside id="file-management-container">
            <FileUpload onFileUpload={onFileLoad} />
            <div className="file-management-ifc-files-wrapper">
                {loadedFileComponents.map((model, index) => {
                    return (
                        <LoadedFile
                            key={index}
                            fileName={model.name}
                            onEditModalToggle={() => {
                                editModal.toggle();
                                setActiveFile(model);
                            }}
                            onRemoveModalToggle={() => {
                                removeModal.toggle();
                                setActiveFile(model);
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

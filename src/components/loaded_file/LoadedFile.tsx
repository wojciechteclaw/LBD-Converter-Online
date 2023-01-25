import { FC } from "react";
import "./LoadedFile.css";
import { Modal } from "../modal/Modal";
import { useModal } from "@hooks/useModal";
import { ParserSettingsForm } from "../parser_settings_form/ParserSettingsForm";

interface LoadedFileProps {
    fileName: string;
    index: number;
    onRemoveFile: (fileIndex: number) => void;
}

const LoadedFile: FC<LoadedFileProps> = ({ fileName, index, onRemoveFile }) => {
    const editModal = useModal(false);
    const removeModal = useModal(false);

    return (
        <div className="ifc-file-container">
            <p className="ifc-file-name">{fileName}</p>
            <i className="edit icon ifc-file-edit-button" onClick={editModal.toggle}></i>
            <i className="trash icon ifc-file-edit-button" onClick={removeModal.toggle}></i>
            <Modal isOpen={editModal.isOpen} toggle={editModal.toggle} key={`${index}.1`}>
                <div>
                    <h2 className="ifc-file-modal-title">LBD ParserSettings Editor</h2>
                    <p className="ifc-file-modal-message">
                        Modify setting for <b>{fileName}</b>
                    </p>
                    <ParserSettingsForm index={index} visibilityToggle={editModal.toggle} />
                </div>
            </Modal>
            <Modal isOpen={removeModal.isOpen} toggle={removeModal.toggle} key={`${index}.2`}>
                <h2 className="ifc-file-modal-title">Remove file</h2>
                <p className="ifc-file-modal-message">
                    Are you sure you want to delete the file: <b>{fileName}</b>?
                </p>
                <div className="ifc-file-buttons">
                    <button
                        className="ui green button"
                        onClick={() => {
                            onRemoveFile(index);
                            removeModal.toggle();
                        }}
                    >
                        Continue
                    </button>
                    <button className="ui red button" onClick={removeModal.toggle}>
                        Cancel
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export { LoadedFile };

import { ifcManagerService } from "@services/dependency_injection";
import { ParsingObject } from "@/types/parsing_object";
import { FC } from "react";
import { Modal } from "../modal/Modal";

interface RemoveModalProps {
    activeFile: ParsingObject | null;
    isOpen: boolean;
    onRemoveFile: (fileIndex: number) => void;
    toggle: () => void;
}

const RemoveModal: FC<RemoveModalProps> = ({ isOpen, toggle, activeFile, onRemoveFile }) => {
    if (!activeFile) return null;
    return (
        <Modal isOpen={isOpen} toggle={toggle} key={`${activeFile.modelID}.2`}>
            <h2 className="modal-title">Remove file</h2>
            <p className="modal-message">
                Are you sure you want to delete the file: <b>{activeFile.fileName}</b>?
            </p>
            <div className="ifc-file-buttons">
                <button
                    className="ui green button"
                    onClick={() => {
                        onRemoveFile(activeFile.modelID);
                        ifcManagerService.removeFileFromIfcAPI(activeFile.modelID);
                        toggle();
                    }}
                >
                    Continue
                </button>
                <button className="ui red button" onClick={toggle}>
                    Cancel
                </button>
            </div>
        </Modal>
    );
};

export default RemoveModal;

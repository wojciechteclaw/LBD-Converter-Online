import { IfcModel } from "@/types/ifc_model";
import { ParsingObject } from "@/types/parsing_object";
import { FC } from "react";
import { Modal } from "../modal/Modal";
import { ParserSettingsForm } from "../parser_settings_form/ParserSettingsForm";

interface EditModalProps {
    activeFile: IfcModel | null;
    isOpen: boolean;
    toggle: () => void;
}

export const EditModal: FC<EditModalProps> = ({ isOpen, toggle, activeFile }) => {
    if (!activeFile) return null;
    return (
        <Modal isOpen={isOpen} toggle={toggle} key={activeFile.id}>
            <div>
                <h2 className="modal-title">LBD ParserSettings Editor</h2>
                <p className="modal-message">
                    Modify setting for <b>{activeFile.name}</b>
                </p>
                <ParserSettingsForm modelID={activeFile.id} visibilityToggle={toggle} />
            </div>
        </Modal>
    );
};

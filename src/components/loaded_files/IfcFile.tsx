import { FC } from "react";
import { ParserSettings } from "ifc-lbd";
import "./IfcFile.css";
import { Modal } from "../modal/Modal";
import { useModal } from "@hooks/useModal";

interface IfcFileProps {
    fileName: string;
    parserSettings: ParserSettings;
    index: number;
    onRemoveFile: (fileIndex: number) => void;
}

const IfcFile: FC<IfcFileProps> = ({ fileName, parserSettings, index, onRemoveFile }) => {
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
                    <div className="">
                        <form className="ui form">
                            <p className="ifc-file-parser-section-title">project namespace</p>
                            <div className="field">
                                <input type="text" name="first-name" placeholder="Namespace" />
                            </div>
                            <p className="ifc-file-parser-section-title">Parsers</p>
                            <div className="two fields">
                                <div className="field">
                                    <div className="ui toggle checkbox">
                                        <input type="checkbox" name="public" />
                                        <label>BOT</label>
                                    </div>
                                </div>
                                <div className="field">
                                    <div className="ui toggle checkbox">
                                        <input type="checkbox" name="public" />
                                        <label>FSO</label>
                                    </div>
                                </div>
                            </div>
                            <div className="two fields">
                                <div className="field">
                                    <div className="ui toggle checkbox">
                                        <input type="checkbox" name="public" />
                                        <label>products</label>
                                    </div>
                                </div>
                                <div className="field">
                                    <div className="ui toggle checkbox">
                                        <input type="checkbox" name="public" />
                                        <label>properties</label>
                                    </div>
                                </div>
                            </div>
                            <p className="ifc-file-parser-section-title">Other options</p>
                            <div className="two fields">
                                <div className="field">
                                    <div className="ui toggle checkbox">
                                        <input type="checkbox" name="public" />
                                        <label>Normalize to SI</label>
                                    </div>
                                </div>
                                <div className="field">
                                    <div className="ui toggle checkbox">
                                        <input type="checkbox" name="public" />
                                        <label>Verbose</label>
                                    </div>
                                </div>
                            </div>
                            <button className="ui button" type="submit">
                                Submit
                            </button>
                        </form>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={removeModal.isOpen} toggle={removeModal.toggle} key={`${index}.2`}>
                <h2 className="ifc-file-modal-title">Remove file</h2>
                <p className="ifc-file-modal-message">
                    Are you sure you want to delete the file: <b>{fileName}</b>?
                </p>
                <div className="ifc-file-buttons">
                    <button className="ui green button" onClick={() => onRemoveFile(index)}>
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

export { IfcFile };

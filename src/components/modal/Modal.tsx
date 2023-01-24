import { ReactNode, FC } from "react";
import "./Modal.css";

interface ModalProps {
    children?: ReactNode;
    isOpen: boolean;
    toggle: () => void;
}

const Modal: FC<ModalProps> = ({ children, isOpen, toggle }) => {
    return (
        <>
            {isOpen && (
                <div className="modal-overlay" onClick={toggle}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        {children}
                    </div>
                </div>
            )}
        </>
    );
};

export { Modal };

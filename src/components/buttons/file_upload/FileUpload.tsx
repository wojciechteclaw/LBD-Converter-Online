import { FC } from "react";

interface DragAndDropProps {
    onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUpload: FC<DragAndDropProps> = ({ onFileUpload }) => {
    return (
        <div>
            <input
                type="file"
                id="ui-button-drag-and-drop"
                multiple={true}
                onChange={(e) => {
                    onFileUpload(e);
                }}
            />
        </div>
    );
};

export { FileUpload };

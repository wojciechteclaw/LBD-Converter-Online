        import { FC } from "react";
        import { FileUpload } from "@components/buttons/file_upload/FileUpload";
        import "./FilesManagementContainer.css";
        import { IfcAPI } from "web-ifc/web-ifc-api";
        // import { geometryService } from "@services/dependency_injection";

        const FilesManagementContainer: FC = () => {
            const onFileLoad = (e) => {
                if (e.target.files != null) {
                    // some logic
                    const ifcAPI = new IfcAPI()
                }
            };

            return (
                <div id="file-management-container">
                    <FileUpload onFileUpload={onFileLoad} />
                </div>
            );
        };

        export { FilesManagementContainer };

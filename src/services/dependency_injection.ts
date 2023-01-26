import { DBDataController } from "./db/db_data_controller";
import { IfcManagerService } from "./ifc_manager_service";
import { FilesService } from "./files_service";

const dbDataController = new DBDataController();
const filesService = new FilesService();
const ifcManagerService = new IfcManagerService();

export { filesService, ifcManagerService, dbDataController };

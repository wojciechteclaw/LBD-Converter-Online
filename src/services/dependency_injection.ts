import { ColorsManager } from "./colors_manager";
import { DBDataController } from "./db_data_controller";
import { IfcManagerService } from "./ifc_manager_service";
import { FilesService } from "./files_service";

const colorsManager = new ColorsManager();
const dbDataController = new DBDataController();
const filesService = new FilesService();
const ifcManagerService = new IfcManagerService();

export { filesService, ifcManagerService, dbDataController, colorsManager };

import { ColorsManager } from "./colors_manager";
import { DBDataController } from "./db_data_controller";
import { FilesService } from "./files_service";
import { IfcControllerService } from "./ifc_controller_service";

const colorsManager = new ColorsManager();
const dbDataController = new DBDataController();
const filesService = new FilesService();
const ifcControllerService = new IfcControllerService();

export { colorsManager, dbDataController, filesService, ifcControllerService };

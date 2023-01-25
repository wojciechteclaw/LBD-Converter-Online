import { DBDataController } from "./db/db_data_controller";
import { TriplesStore } from "./db/triples_store";
import { FilesService } from "./files_service";
import { GeometryService } from "./geometry_service";

// const store = new TriplesStore();
// const dbDataController = new DBDataController(store);
// // add to worker
const geometryService = new GeometryService();
const filesService = new FilesService();

export { filesService };

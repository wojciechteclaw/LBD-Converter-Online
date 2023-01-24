// import { DBDataController } from "./db/db_data_controller";
// import { TriplesStore } from "./db/triples_store";
import { GeometryService } from "./geometry_service";

// const store = new TriplesStore();
// const dbDataController = new DBDataController(store);
const geometryService = new GeometryService();

export { geometryService };

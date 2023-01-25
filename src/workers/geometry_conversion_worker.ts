import { GeometryService } from "@services/geometry_service";
import { expose } from "comlink";
import { PlacedGeometry } from "web-ifc";

const geometryConversionWorker = async (
    ifcMeshGeometry: PlacedGeometry,
    vertices: Float32Array,
    indices: Uint32Array
) => {
    return await GeometryService.convertIfcGeometryToThreeMesh(ifcMeshGeometry, vertices, indices).then((e) => e);
};

const worker = {
    geometryConversionWorker,
};

export type GeometryConversionWorkerType = typeof worker;
expose(worker);

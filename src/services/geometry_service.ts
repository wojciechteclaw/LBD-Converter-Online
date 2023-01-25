import { ExpressIDSpacesMap } from "@/types/guid_spaces_map";
import { GeometryConversionWorkerType } from "@/workers/geometry_conversion_worker";
import { wrap } from "comlink";
import {
    BufferGeometry,
    InterleavedBuffer,
    BufferAttribute,
    InterleavedBufferAttribute,
    Mesh,
    Matrix4,
    Color as ThreeColor,
    Material,
    MeshPhongMaterial,
    DoubleSide,
} from "three";
import { IfcAPI, IFCSPACE, PlacedGeometry, Color, FlatMesh, IfcGeometry } from "web-ifc";

class GeometryService {
    public static async getSpacesGeometry(modelID: number, ifcAPI: IfcAPI): Promise<ExpressIDSpacesMap> {
        let result: ExpressIDSpacesMap = new Map();
        const spacesGeometryPromises: Array<Promise<BufferGeometry>> = [];
        const expressIDs: number[] = [];
        const allSpaces = ifcAPI.GetLineIDsWithType(0, IFCSPACE);
        const worker = new Worker(new URL("../workers/geometry_conversion_worker.ts", import.meta.url), {
            type: "module",
            name: "geometry_conversion_worker",
        });
        const { geometryConversionWorker } = wrap<GeometryConversionWorkerType>(worker);
        for (let i = 0; i < allSpaces.size(); i++) {
            const expressID = allSpaces.get(i);
            let flatMesh: FlatMesh = ifcAPI.GetFlatMesh(modelID, expressID);
            let placedGeometry: PlacedGeometry = flatMesh.geometries.get(0);
            let [vertices, indices] = await this.transformIfcGeometryToAtoms(ifcAPI, modelID, placedGeometry).then(
                (e) => e
            );
            spacesGeometryPromises.push(geometryConversionWorker(placedGeometry, vertices, indices).then((e) => e));
            expressIDs.push(expressID);
        }
        await Promise.all(spacesGeometryPromises).then((e) =>
            e.forEach((spaceGeometry, index) => {
                result.set(expressIDs[index], spaceGeometry);
            })
        );
        return result;
    }

    private static async transformIfcGeometryToAtoms(
        ifcAPI: IfcAPI,
        modelID: number,
        placedGeometry: PlacedGeometry
    ): Promise<[Float32Array, Uint32Array]> {
        let geometry: IfcGeometry = ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
        let vertices: Float32Array = ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        let indices = ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        return [vertices, indices];
    }

    public static async convertIfcGeometryToThreeMesh(
        ifcMeshGeometry: PlacedGeometry,
        vertices: Float32Array,
        indices: Uint32Array
    ): Promise<BufferGeometry> {
        const bufferGeometry = await GeometryService.buildThreeGeometry(vertices, indices).then((e) => e);
        const material = await GeometryService.buildMeshMaterial(ifcMeshGeometry.color).then((e) => e);
        const mesh = new Mesh(bufferGeometry, material);
        const matrix = new Matrix4().fromArray(ifcMeshGeometry.flatTransformation.map((x) => +x.toFixed(5)));
        mesh.matrix = matrix;
        mesh.matrixAutoUpdate = false;
        return mesh.geometry;
    }

    private static async buildThreeGeometry(vertices: Float32Array, indices: Uint32Array): Promise<BufferGeometry> {
        const geometry = new BufferGeometry();
        const positionNormalBuffer = new InterleavedBuffer(vertices, 6);
        geometry.setAttribute("position", new InterleavedBufferAttribute(positionNormalBuffer, 3, 0));
        geometry.setAttribute("normal", new InterleavedBufferAttribute(positionNormalBuffer, 3, 3));
        geometry.setIndex(new BufferAttribute(indices, 1));
        return geometry;
    }

    private static async buildMeshMaterial(ifcColor: Color): Promise<Material> {
        const threeColor = new ThreeColor(ifcColor.x, ifcColor.y, ifcColor.z);
        const material = new MeshPhongMaterial({
            color: threeColor,
            side: DoubleSide,
        });
        material.transparent = ifcColor.w !== 1;
        if (material.transparent) {
            material.opacity = ifcColor.w;
        }
        return material;
    }
}

export { GeometryService };

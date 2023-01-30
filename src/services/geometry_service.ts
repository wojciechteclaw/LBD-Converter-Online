import { ModelIDExpressIDSpacesMap } from "@/types/expressId_spaces_geometry";
import { ExpressIDSpacesMap } from "@/types/guid_spaces_map";
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
    public static async getSpacesGeometryForModelID(modelID: number, ifcAPI: IfcAPI): Promise<ExpressIDSpacesMap> {
        let result: ExpressIDSpacesMap = new Map();
        ifcAPI.StreamAllMeshesWithTypes(modelID, [IFCSPACE], (flatMesh: FlatMesh) => {
            let placedGeometry: PlacedGeometry = flatMesh.geometries.get(0);
            let [vertices, indices] = GeometryService.transformIfcGeometryToAtoms(ifcAPI, modelID, placedGeometry);
            let spaceGeometry = GeometryService.convertIfcGeometryToThreeMesh(placedGeometry, vertices, indices);
            result.set(flatMesh.expressID, spaceGeometry);
        });
        return result;
    }

    private static transformIfcGeometryToAtoms(
        ifcAPI: IfcAPI,
        modelID: number,
        placedGeometry: PlacedGeometry
    ): [Float32Array, Uint32Array] {
        let geometry: IfcGeometry = ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
        let vertices: Float32Array = ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        let indices = ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        return [vertices, indices];
    }

    public static convertIfcGeometryToThreeMesh(
        ifcMeshGeometry: PlacedGeometry,
        vertices: Float32Array,
        indices: Uint32Array
    ): BufferGeometry {
        const bufferGeometry = GeometryService.buildThreeGeometry(vertices, indices);
        const material = GeometryService.buildMeshMaterial(ifcMeshGeometry.color);
        const mesh = new Mesh(bufferGeometry, material);
        const matrix = new Matrix4().fromArray(ifcMeshGeometry.flatTransformation.map((x) => +x.toFixed(5)));
        mesh.matrix = matrix;
        mesh.matrixAutoUpdate = false;
        return mesh.geometry;
    }

    public static async compareGeometriesWorker(
        modelIDsExpressGeometry: ModelIDExpressIDSpacesMap,
        ifcModelExpressIdGuidsMap: ModelIDExpressIDSpacesMap
    ) {}


    private static buildThreeGeometry(vertices: Float32Array, indices: Uint32Array): BufferGeometry {
        const geometry = new BufferGeometry();
        const positionNormalBuffer = new InterleavedBuffer(vertices, 6);
        geometry.setAttribute("position", new InterleavedBufferAttribute(positionNormalBuffer, 3, 0));
        geometry.setAttribute("normal", new InterleavedBufferAttribute(positionNormalBuffer, 3, 3));
        geometry.setIndex(new BufferAttribute(indices, 1));
        return geometry;
    }

    private static buildMeshMaterial(ifcColor: Color): Material {
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

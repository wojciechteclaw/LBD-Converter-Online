import {
    BufferGeometry,
    InterleavedBuffer,
    BufferAttribute,
    InterleavedBufferAttribute,
    Mesh,
    Matrix4,
    Color as ThreeColor,
    Material,
    Vector3,
    MeshBasicMaterial,
    Quaternion,
} from "three";
import { IfcAPI, IFCSPACE, PlacedGeometry, Color, FlatMesh, IfcGeometry, IFCBUILDINGSTOREY } from "web-ifc";
import { GuidUriService } from "./guid_uri_service";
import { ExpressIdToElementRepresentation } from "@/types/element_representation/express_id_to_element_representation";
import { CSG } from "three-csg-ts";
import { GeometricalRepresentation } from "@/types/element_representation/geometrical_representation";
import { Representation } from "@enums/representation";

class GeometryService {
    public static convertIfcGeometryToThreeMesh(
        ifcMeshGeometry: PlacedGeometry,
        vertices: Float32Array,
        indices: Uint32Array
    ): Mesh {
        const bufferGeometry = GeometryService.buildThreeGeometry(vertices, indices);
        bufferGeometry.computeVertexNormals();
        const material = GeometryService.buildMeshMaterial(ifcMeshGeometry.color);
        const mesh = new Mesh(bufferGeometry, material);
        const matrix = new Matrix4().fromArray(ifcMeshGeometry.flatTransformation.map((x) => +x.toFixed(5)));
        mesh.matrix = matrix;
        mesh.matrixAutoUpdate = false;
        return mesh;
    }

    public static async getLevelsContextGuidMap(
        modelID: number,
        ifcAPI: IfcAPI
    ): Promise<ExpressIdToElementRepresentation> {
        let levels = ifcAPI.GetLineIDsWithType(modelID, IFCBUILDINGSTOREY);
        let result: ExpressIdToElementRepresentation = new Map();
        for (let i = 0; i < levels.size(); i++) {
            let expressID = levels.get(i);
            let level = ifcAPI.GetLine(modelID, expressID);
            let guid = await GuidUriService.getLevelContextBasedGuid(level);
            result.set(expressID, { contextString: guid, type: Representation.LEVEL });
        }
        return result;
    }

    public static async getSpacesContextGuidMap(
        modelID: number,
        ifcAPI: IfcAPI
    ): Promise<ExpressIdToElementRepresentation> {
        const result = new Map<number, GeometricalRepresentation>();
        ifcAPI.StreamAllMeshesWithTypes(modelID, [IFCSPACE], async (flatMesh: FlatMesh) => {
            const placedGeometry: PlacedGeometry = flatMesh.geometries.get(0);
            let matrix = this.getMeshMatrix(placedGeometry.flatTransformation);
            let buffer = this.convertPlacedGeometryToThreeMesh(modelID, ifcAPI, placedGeometry);
            const mesh = new Mesh(buffer);
            mesh.applyMatrix4(matrix);
            const volume = await GeometryService.getVolume(buffer);
            result.set(flatMesh.expressID, { geometry: mesh, volume: volume, type: Representation.SPACE });
            console.log(mesh);
        });
        return result;
    }

    private static getMeshMatrix(matrix: Array<number>) {
        const mat = new Matrix4();
        mat.fromArray(matrix);
        return mat;
    }

    private static convertPlacedGeometryToThreeMesh(
        modelId: number,
        ifcAPI: IfcAPI,
        ifcMeshGeometry: PlacedGeometry
    ): BufferGeometry {
        const geometry = ifcAPI.GetGeometry(modelId, ifcMeshGeometry.geometryExpressID);
        const vertices = ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        const indices = ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        const bufferGeometry = GeometryService.buildThreeGeometry(vertices, indices);
        return bufferGeometry;
    }

    public static transformIfcGeometryToAtoms(
        ifcAPI: IfcAPI,
        modelID: number,
        placedGeometry: PlacedGeometry
    ): [Float32Array, Uint32Array] {
        let geometry: IfcGeometry = ifcAPI.GetGeometry(modelID, placedGeometry.geometryExpressID);
        let vertices: Float32Array = ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        let indices = ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        return [vertices, indices];
    }

    private static buildMeshMaterial(ifcColor: Color): Material {
        const threeColor = new ThreeColor(ifcColor.x, ifcColor.y, ifcColor.z);
        let material = new MeshBasicMaterial({ color: threeColor });
        material.transparent = ifcColor.w !== 1;
        if (material.transparent) {
            material.opacity = ifcColor.w;
        }
        return material;
    }

    private static buildThreeGeometry(vertices: Float32Array, indices: Uint32Array): BufferGeometry {
        const geometry = new BufferGeometry();
        const positionNormalBuffer = new InterleavedBuffer(vertices, 6);
        geometry.setAttribute("position", new InterleavedBufferAttribute(positionNormalBuffer, 3, 0));
        geometry.setAttribute("normal", new InterleavedBufferAttribute(positionNormalBuffer, 3, 3));
        geometry.setIndex(new BufferAttribute(indices, 1));
        return geometry;
    }

    public static compareTwoGeometryRepresentations(
        geometry1: GeometricalRepresentation,
        geometry2: GeometricalRepresentation
    ): boolean {
        let mesh1 = CSG.fromMesh(geometry1.geometry);
        let mesh2 = CSG.fromMesh(geometry2.geometry);
        let result = mesh1.intersect(mesh2);
        let volume = GeometryService.getVolume(result.toGeometry(new Matrix4()));
        return (
            volume > 0.95 * geometry1.volume &&
            volume > 0.95 * geometry2.volume &&
            geometry1.volume > 0.95 * geometry2.volume &&
            geometry1.volume < 1.05 * geometry2.volume
        );
    }

    public static getVolume(geometry: BufferGeometry) {
        var isIndexed = geometry.index !== null;
        let position = geometry.attributes.position;
        let sum = 0;
        let p1 = new Vector3(),
            p2 = new Vector3(),
            p3 = new Vector3();
        if (!isIndexed) {
            let faces = position.count / 3;
            for (let i = 0; i < faces; i++) {
                p1.fromBufferAttribute(position, i * 3 + 0);
                p2.fromBufferAttribute(position, i * 3 + 1);
                p3.fromBufferAttribute(position, i * 3 + 2);
                sum += GeometryService.signedVolumeOfTriangle(p1, p2, p3);
            }
        } else {
            let index = geometry.index;
            let faces = index!.count / 3;
            for (let i = 0; i < faces; i++) {
                p1.fromBufferAttribute(position, index!.array[i * 3 + 0]);
                p2.fromBufferAttribute(position, index!.array[i * 3 + 1]);
                p3.fromBufferAttribute(position, index!.array[i * 3 + 2]);
                sum += GeometryService.signedVolumeOfTriangle(p1, p2, p3);
            }
        }
        return sum;
    }

    private static signedVolumeOfTriangle(p1: Vector3, p2: Vector3, p3: Vector3) {
        return p1.dot(p2.cross(p3)) / 6.0;
    }
}

export { GeometryService };

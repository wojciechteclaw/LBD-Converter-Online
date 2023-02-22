import {
    BufferGeometry,
    BufferAttribute,
    Mesh,
    Matrix4,
    Color as ThreeColor,
    Vector3,
    MeshPhongMaterial,
    DoubleSide,
    Material,
} from "three";
import { IfcAPI, IFCSPACE, PlacedGeometry, Color, FlatMesh, IFCBUILDINGSTOREY } from "web-ifc";
import { GuidUriService } from "./guid_uri_service";
import { ExpressIdToElementRepresentation } from "@/types/element_representation/express_id_to_element_representation";
import { CSG } from "three-csg-ts";
import { GeometricalRepresentation } from "@/types/element_representation/geometrical_representation";
import { Representation } from "@enums/representation";

class GeometryService {
    public static compareTwoGeometryRepresentations(
        element1: GeometricalRepresentation,
        element2: GeometricalRepresentation
    ): boolean {
        let intersectionMesh = CSG.intersect(element1.mesh, element2.mesh);
        let intersectVolume = GeometryService.getVolume(intersectionMesh.geometry);
        return (
            intersectVolume > 0.95 * element1.volume &&
            intersectVolume > 0.95 * element2.volume &&
            element1.volume > 0.95 * element2.volume &&
            element1.volume < 1.05 * element2.volume
        );
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
            const mesh = this.getPlacedGeometry(modelID, ifcAPI, placedGeometry);
            const volume = await GeometryService.getVolume(mesh.geometry);
            result.set(flatMesh.expressID, {
                mesh: mesh,
                volume: volume,
                type: Representation.SPACE,
            });
        });
        return result;
    }

    public static getVolume(geometry: BufferGeometry): number {
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

    private static getBufferGeometry(
        modelID: number,
        ifcApi: IfcAPI,
        placedGeometry: PlacedGeometry
    ): BufferGeometry {
        const geometry = ifcApi.GetGeometry(modelID, placedGeometry.geometryExpressID);
        const verts = ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        const indices = ifcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        return this.ifcGeometryToBuffer(placedGeometry.color, verts, indices);
    }

    private static getMeshMatrix(matrix: Array<number>): Matrix4 {
        const mat = new Matrix4();
        mat.fromArray(matrix);
        return mat;
    }

    private static getMeshMaterial(color: Color): Material {
        const col = new ThreeColor(color.x, color.y, color.z);
        return new MeshPhongMaterial({ color: col, side: DoubleSide });
    }

    private static getPlacedGeometry(
        modelID: number,
        ifcApi: IfcAPI,
        placedGeometry: PlacedGeometry
    ): Mesh {
        const geometry = this.getBufferGeometry(modelID, ifcApi, placedGeometry);
        const material = this.getMeshMaterial(placedGeometry.color);
        const mesh = new Mesh(geometry, material);
        mesh.matrix = this.getMeshMatrix(placedGeometry.flatTransformation);
        mesh.matrixAutoUpdate = false;
        return mesh;
    }

    private static ifcGeometryToBuffer(
        color: Color,
        vertexData: Float32Array,
        indexData: Uint32Array
    ): BufferGeometry {
        const geometry = new BufferGeometry();
        let posFloats = new Float32Array(vertexData.length / 2);
        let normFloats = new Float32Array(vertexData.length / 2);
        let colorFloats = new Float32Array(vertexData.length / 2);

        for (let i = 0; i < vertexData.length; i += 6) {
            posFloats[i / 2 + 0] = vertexData[i + 0];
            posFloats[i / 2 + 1] = vertexData[i + 1];
            posFloats[i / 2 + 2] = vertexData[i + 2];

            normFloats[i / 2 + 0] = vertexData[i + 3];
            normFloats[i / 2 + 1] = vertexData[i + 4];
            normFloats[i / 2 + 2] = vertexData[i + 5];

            colorFloats[i / 2 + 0] = color.x;
            colorFloats[i / 2 + 1] = color.y;
            colorFloats[i / 2 + 2] = color.z;
        }
        geometry.setAttribute("position", new BufferAttribute(posFloats, 3));
        geometry.setAttribute("normal", new BufferAttribute(normFloats, 3));
        geometry.setAttribute("color", new BufferAttribute(colorFloats, 3));
        geometry.setIndex(new BufferAttribute(indexData, 1));
        return geometry;
    }

    private static signedVolumeOfTriangle(p1: Vector3, p2: Vector3, p3: Vector3): number {
        return p1.dot(p2.cross(p3)) / 6.0;
    }
}

export { GeometryService };

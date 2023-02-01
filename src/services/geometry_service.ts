import { ExpressIDContextGuid } from "@/types/guid_spaces_map";
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
    Vector3,
} from "three";
import { IfcAPI, IFCSPACE, PlacedGeometry, Color, FlatMesh, IfcGeometry, IFCBUILDINGSTOREY } from "web-ifc";
import { GuidUriService } from "./guid_uri_service";
import { IfcManagerService } from "./ifc_manager_service";

class GeometryService {
    public static async getSpacesExpressIdContextGuidMap(
        modelID: number,
        ifcAPI: IfcAPI
    ): Promise<ExpressIDContextGuid> {
        let result: ExpressIDContextGuid = new Map();
        ifcAPI.StreamAllMeshesWithTypes(modelID, [IFCSPACE], async (flatMesh: FlatMesh) => {
            let placedGeometry: PlacedGeometry = flatMesh.geometries.get(0);
            let [vertices, indices] = GeometryService.transformIfcGeometryToAtoms(ifcAPI, modelID, placedGeometry);
            let spaceMesh = GeometryService.convertIfcGeometryToThreeMesh(placedGeometry, vertices, indices);
            spaceMesh.geometry.computeBoundingSphere();
            spaceMesh.geometry.boundingSphere!.applyMatrix4(spaceMesh.matrix);
            let spaceGeometry = spaceMesh.geometry;
            let volume = await GeometryService.getVolume(spaceMesh.geometry);
            let guid = await GuidUriService.getSpaceContextBasedGuid(
                spaceGeometry.boundingSphere!.center,
                spaceGeometry.boundingSphere!.radius,
                volume,
                spaceGeometry.index!.array.length
            ).then((e) => e);
            result.set(flatMesh.expressID, guid);
        });
        return result;
    }

    public static async getLevelsExpressIdContextGuidMap(
        modelID: number,
        ifcAPI: IfcAPI
    ): Promise<ExpressIDContextGuid> {
        let levels = ifcAPI.GetLineIDsWithType(modelID, IFCBUILDINGSTOREY);
        let result: ExpressIDContextGuid = new Map();
        for (let i = 0; i < levels.size(); i++) {
            let expressID = levels.get(i);
            let level = ifcAPI.GetLine(modelID, expressID)
            let guid = await GuidUriService.getLevelContextBasedGuid(level);
            result.set(expressID, guid);
        }
        return result;
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

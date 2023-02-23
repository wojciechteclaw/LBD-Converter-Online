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
import { IfcAPI, PlacedGeometry, Color, FlatMesh } from "web-ifc";

class GeometryOperations {
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
                sum += this.signedVolumeOfTriangle(p1, p2, p3);
            }
        } else {
            let index = geometry.index;
            let faces = index!.count / 3;
            for (let i = 0; i < faces; i++) {
                p1.fromBufferAttribute(position, index!.array[i * 3 + 0]);
                p2.fromBufferAttribute(position, index!.array[i * 3 + 1]);
                p3.fromBufferAttribute(position, index!.array[i * 3 + 2]);
                sum += this.signedVolumeOfTriangle(p1, p2, p3);
            }
        }
        return sum;
    }

    private static getBufferGeometry(modelID: number, ifcApi: IfcAPI, placedGeometry: PlacedGeometry): BufferGeometry {
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

    public static getMesh(modelID: number, ifcApi: IfcAPI, flatMesh: FlatMesh): Mesh {
        const placedGeometry = flatMesh.geometries.get(0);
        const geometry = this.getBufferGeometry(modelID, ifcApi, placedGeometry);
        const material = this.getMeshMaterial(placedGeometry.color);
        const mesh = new Mesh(geometry, material);
        mesh.matrix = this.getMeshMatrix(placedGeometry.flatTransformation);
        mesh.matrixAutoUpdate = false;
        return mesh;
    }

    private static ifcGeometryToBuffer(color: Color, vertexData: Float32Array, indexData: Uint32Array): BufferGeometry {
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

export { GeometryOperations };

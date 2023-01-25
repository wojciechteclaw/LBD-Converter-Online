import { Color, IfcAPI, IfcConnectionGeometry, IfcGeometry, IFCSPACE, PlacedGeometry } from "web-ifc";
import * as THREE from "three";
import { FilesService } from "./files_service";
import { ExpressIdSpacesGeometry } from "@/types/expressId_spaces_geometry";

class IfcManagerService {
    private ifcAPI: IfcAPI = new IfcAPI();
    private ifcSpacesGeometry: ExpressIdSpacesGeometry = new Map();

    constructor() {
        this.configureIfcAPI();
    }

    private configureIfcAPI() {
        let assetsPath = "../../assets/";
        this.ifcAPI.SetWasmPath(assetsPath);
        this.ifcAPI.Init();
    }

    public async appendFileToIfcAPI(file: File): Promise<number> {
        let fileBuffer = await FilesService.readInputFile(file).then((e) => e);
        let parsedBuffer = new Uint8Array(fileBuffer);
        let modelID = this.ifcAPI.OpenModel(parsedBuffer);
        return modelID;
    }

    public async appendSpacesGeometryMap(modelID): Promise<void> {
        //
    }

    public async removeFileFromIfcAPI(modelID: number) {
        this.ifcAPI.CloseModel(modelID);
    }

    public async removeSpacesGeometryMap(modelID: number) {
        //
    }

    private convertIfcGeometryToThreeMesh(modelId: number, ifcMeshGeometry: PlacedGeometry) {
        const geometry = this.ifcAPI.GetGeometry(modelId, ifcMeshGeometry.geometryExpressID);
        const vertices = this.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        const indices = this.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        const bufferGeometry = IfcManagerService.buildThreeGeometry(vertices, indices);
        const material = IfcManagerService.buildMeshMaterial(ifcMeshGeometry.color);
        const mesh = new THREE.Mesh(bufferGeometry, material);
        const matrix = new THREE.Matrix4().fromArray(ifcMeshGeometry.flatTransformation.map((x) => +x.toFixed(5)));
        mesh.matrix = matrix;
        mesh.matrixAutoUpdate = false;
        return mesh;
    }

    private static buildThreeGeometry(vertices: Float32Array, indices: Uint32Array): THREE.BufferGeometry {
        const geometry = new THREE.BufferGeometry();
        const positionNormalBuffer = new THREE.InterleavedBuffer(vertices, 6);
        geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(positionNormalBuffer, 3, 0));
        geometry.setAttribute("normal", new THREE.InterleavedBufferAttribute(positionNormalBuffer, 3, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        return geometry;
    }

    private static buildMeshMaterial(ifcColor: Color): THREE.Material {
        const threeColor = new THREE.Color(ifcColor.x, ifcColor.y, ifcColor.z);
        const material = new THREE.MeshPhongMaterial({
            color: threeColor,
            side: THREE.DoubleSide,
        });
        material.transparent = ifcColor.w !== 1;
        if (material.transparent) {
            material.opacity = ifcColor.w;
        }
        return material;
    }

    public getSpacesGeometry(modelID: number) {
        const results = new Array<THREE.BufferGeometry>();
        const allSpaces = this.ifcAPI.GetLineIDsWithType(0, IFCSPACE);
        for (let i = 0; i < allSpaces.size(); i++) {
            const expressID = allSpaces.get(i);
            let flatMesh = this.ifcAPI.GetFlatMesh(modelID, expressID);
            let placedGeometry = flatMesh.geometries.get(0);
            let mesh = this.convertIfcGeometryToThreeMesh(modelID, placedGeometry);
            console.log(mesh.geometry);
        }
    }
}

export { IfcManagerService };

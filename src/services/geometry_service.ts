import { IfcAPI } from "web-ifc/web-ifc-api";
import * as THREE from "three";

class GeometryService {
    private ifcAPI: IfcAPI = new IfcAPI();

    constructor() {
        this.configureIfcAPI();
    }

    private configureIfcAPI() {
        let assetsPath = "../../assets/";
        this.ifcAPI.SetWasmPath(assetsPath);
        this.ifcAPI.Init();
    }

    public async appendFileToIfcAPI(file: File) {
        let fileBuffer = await this.readInputFile(file).then((e) => e as ArrayBufferLike);
        let parsedBuffer = new Uint8Array(fileBuffer);
        this.ifcAPI.OpenModel(parsedBuffer);
        console.log(file)
    }

    private readInputFile(file: File) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.addEventListener("loadend", (e) => resolve((e.target as FileReader).result));
            reader.addEventListener("error", reject);
            reader.readAsArrayBuffer(file);
        });
    }

    // https://github.com/IFCjs/web-ifc/issues/123

    // private convertIfcGeometryToThreeMesh(modelId: number, ifcMeshGeometry: PlacedGeometry) {
    // const geometry = this.ifcAPI.GetGeometry(modelId, ifcMeshGeometry.geometryExpressID);
    // const vertices = this.ifcAPI.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
    // const indices = this.ifcAPI.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
    // const bufferGeometry = this.buildThreeGeometry(vertices, indices);
    // const material = this.buildMeshMaterial(ifcMeshGeometry.color);
    // const mesh = new THREE.Mesh(bufferGeometry, material);
    // const matrix = new THREE.Matrix4().fromArray(ifcMeshGeometry.flatTransformation.map((x) => +x.toFixed(5)));
    // mesh.matrix = matrix;
    // mesh.matrixAutoUpdate = false;
    // return mesh;
    // }

    // private buildThreeGeometry(vertices: Float32Array, indices: Uint32Array): THREE.BufferGeometry {
    // const geometry = new THREE.BufferGeometry();
    // const positionNormalBuffer = new THREE.InterleavedBuffer(vertices, 6);
    // geometry.setAttribute("position", new THREE.InterleavedBufferAttribute(positionNormalBuffer, 3, 0));
    // geometry.setAttribute("normal", new THREE.InterleavedBufferAttribute(positionNormalBuffer, 3, 3));
    // geometry.setIndex(new THREE.BufferAttribute(indices, 1));
    // return geometry;
    // }

    // private buildMeshMaterial(ifcColor: Color): THREE.Material {
    // const threeColor = new THREE.Color(ifcColor.x, ifcColor.y, ifcColor.z);
    // const material = new THREE.MeshPhongMaterial({
    //     color: threeColor,
    //     side: THREE.DoubleSide,
    // });
    // material.transparent = ifcColor.w !== 1;
    // if (material.transparent) {
    //     material.opacity = ifcColor.w;
    // }
    // return material;
    // }

    // public getSpacesGeometry(modelID: number) {
    // const results = new Array<THREE.BufferGeometry>();
    // const allSpaces = this.ifcAPI.GetLineIDsWithType(0, IFCSPACE);
    // for (let i = 0; i < allSpaces.size(); i++) {
    //     const expressID = allSpaces.get(i);
    //     const geometry: IfcGeometry = this.ifcAPI.GetGeometry(modelID, expressID);
    //     console.log(geometry);
    // }
    // }
}

export { GeometryService };

import { IfcModel } from "@/types/ifc_model";
import { JSONLD, LBDParser } from "ifc-lbd";
import { IfcAPI } from "web-ifc";

const getFileBuffer = async (file: File): Promise<Uint8Array> => {
    let fileBuffer = await readInputFile(file);
    return new Uint8Array(fileBuffer);
};

const readInputFile = async (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onloadend = (e) => resolve((e.target as FileReader).result as ArrayBuffer);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
};

self.addEventListener("message", async (event) => {
    const { data } = event;
    const model = data.model as IfcModel;
    const ifcAPI = new IfcAPI();
    ifcAPI.SetWasmPath("./assets/");
    ifcAPI.Init();
    console.log("test");
    let parsedFile = await getFileBuffer(model.file).then((e) => e);
    await ifcAPI.OpenModel(parsedFile);
    const lbdParser = new LBDParser(model.parserSettings);
    const result = await lbdParser.parse(ifcAPI, model.id).then((e) => e as JSONLD);
    console.log(result);
    self.postMessage(result);
});

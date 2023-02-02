import { IfcBuildingStorey } from "web-ifc";
import { v5 as uuidv5 } from "uuid";
import { Vector3 } from "three";
import { filesService, ifcManagerService } from "./dependency_injection";

class GuidUriService {
    
    public static async contextBasedGuid(contextString: string) {
        const namespace = "daca0510-72b5-48ba-9091-b918ca18136b";
        return uuidv5(contextString, namespace);
    }

    public static decodeURI(expression: string): string {
        return decodeURIComponent(expression);
    }

    public static encodeURI(expression: string): string {
        return encodeURIComponent(expression);
    }

    public static getElementURI(modelID: number, expressID: number): string {
        let settings = filesService.getParserSettings(modelID);
        let prefix = settings.namespace.endsWith("/") ? settings.namespace : settings.namespace + "/";
        let guid = ifcManagerService.getExpressIDGuidMap(modelID, expressID);
        if (guid === undefined) {
            throw new Error("Guid not found");
        }
        return prefix + GuidUriService.encodeURI(guid);
    }
    
    public static async getLevelContextBasedGuid(level: IfcBuildingStorey): Promise<string> {
        let contextString = `${level!.Elevation!.value.toFixed(3)} ${level!.Name!.value}`;
        return await GuidUriService.contextBasedGuid(contextString);
    }

    public static async getSpaceContextBasedGuid(
        sphereCenter: Vector3,
        radius: number,
        volume: number,
        numberOfIndexPoints: number
    ): Promise<string> {
        let contextString = `${sphereCenter.x.toFixed(3)} ${sphereCenter.y.toFixed(3)} ${sphereCenter.z.toFixed(
            3
        )} ${radius.toFixed(3)} ${volume.toFixed(3)} ${numberOfIndexPoints}`;
        return await GuidUriService.contextBasedGuid(contextString);
    }
}

export { GuidUriService };

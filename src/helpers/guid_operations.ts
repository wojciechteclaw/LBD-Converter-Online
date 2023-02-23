import { Vector3 } from "three";
import { IfcBuildingStorey } from "web-ifc";
import { v5 as uuidv5 } from "uuid";
import { ParserSettings } from "ifc-lbd";
import { IfcElement } from "@/types/ifc_element";

class GuidOperations {
    public static contextBasedGuid(contextString: string) {
        const namespace = "daca0510-72b5-48ba-9091-b918ca18136b";
        return uuidv5(contextString, namespace);
    }

    public static decodeURI(expression: string): string {
        return decodeURIComponent(expression);
    }

    public static encodeURI(expression: string): string {
        return encodeURIComponent(expression);
    }

    public static getElementURI(element: IfcElement, settings: ParserSettings): string {
        let prefix = settings.namespace.endsWith("/") ? settings.namespace : settings.namespace + "/";
        return prefix + this.encodeURI(element.guid);
    }

    public static getLevelContextBasedGuid(level: IfcBuildingStorey): string {
        let contextString = `${level!.Elevation!.value.toFixed(3)} ${level!.Name!.value}`;
        return this.contextBasedGuid(contextString);
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
        return await GuidOperations.contextBasedGuid(contextString);
    }
}

export { GuidOperations };

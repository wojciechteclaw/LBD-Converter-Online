import { Connection } from "@enums/connection";
import { IfcElement } from "./ifc_element";

type ConnectedElements = {
    object: IfcElement;
    subject: IfcElement;
    relation: Connection;
};

export { ConnectedElements };

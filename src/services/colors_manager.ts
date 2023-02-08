class ColorsManager {
    private colors: { [key: string]: string } = {
        "https://w3id.org/bot#": "#42d4f5",
        "https://w3id.org/fog#": "#3cb44b",
        "https://w3id.org/fso#": "#ffe119",
        "http://ifcowl.openbimstandards.org/IFC2X3_Final#": "#4363d8",
        "https://w3id.org/kobl/building-topology#": "#f58231",
        "https://w3id.org/omg#": "#911eb4",
        "http://www.w3.org/2002/07/owl#": "#46f0f0",
        "http://qudt.org/schema/qudt/#": "#f032e6",
        "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "#bcf60c",
        "http://www.w3.org/2000/01/rdf-schema#": "#008080",
        "https://w3id.org/tso#": "#e6beff",
        "http://www.w3.org/2001/XMLSchema#": "#9a6324",
    };
    private colorsIterator: number = 0;

    private addNamespaceToColorMap(namespace: string): string {
        this.colors[namespace] = this.listOfColors[this.colorsIterator % 10];
        this.colorsIterator = this.colorsIterator + 1;
        return this.colors[namespace];
    }

    public getColorByNamespace(namespace: string): string {
        if (this.colors[namespace] === undefined) {
            return this.addNamespaceToColorMap(namespace);
        }
        return this.colors[namespace];
    }

    private readonly listOfColors: string[] = [
        "#800000",
        "#fffac8",
        "#aaffc3",
        "#808000",
        "#ffd8b1",
        "#000075",
        "#808080",
        "#ffffff",
        "#000000",
        "#e6194b",
    ];
}

export { ColorsManager };

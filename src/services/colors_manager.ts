class ColorsManager {
    private colors: { [key: string]: string } = {};
    private colorsIterator: number = 0;

    private async addNamespaceToColorMap(namespace: string): Promise<string> {
        this.colors[namespace] = this.listOfColors[this.colorsIterator % 20];
        this.colorsIterator = this.colorsIterator + 1;
        return this.colors[namespace];
    }

    public async getColorByNamespace(namespace: string): Promise<string> {
        if (this.colors[namespace] === undefined) {
            return await this.addNamespaceToColorMap(namespace).then((e) => e);
        }
        return this.colors[namespace];
    }

    private readonly listOfColors: string[] = [
        "#e6194b",
        "#3cb44b",
        "#ffe119",
        "#4363d8",
        "#f58231",
        "#911eb4",
        "#46f0f0",
        "#f032e6",
        "#bcf60c",
        "#fabebe",
        "#008080",
        "#e6beff",
        "#9a6324",
        "#fffac8",
        "#800000",
        "#aaffc3",
        "#808000",
        "#ffd8b1",
        "#000075",
        "#808080",
        "#ffffff",
        "#000000",
    ];
}

export { ColorsManager };

import { Quad } from "oxigraph/web";

class SparQlGraphParserService {

    queryResult: Quad[];

    constructor(queryResult: Quad[]) {
        this.queryResult = this.queryResult
    }

    public async convertQueryResultToGraphInput(): Promise<any> {
        // 
    }
}

export { SparQlGraphParserService };

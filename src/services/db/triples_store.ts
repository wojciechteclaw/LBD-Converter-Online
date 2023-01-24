// import init, * as oxigraph from "oxigraph/web.js";

// class TriplesStore {
//     private store: oxigraph.Store | undefined;

//     constructor() {
//         this.initStore();
//     }

//     private initStore() {
//         console.time("store initialized");
//         init();
//         this.store = new oxigraph.Store();
//         console.timeEnd("store initialized");
//     }

//     public addTriples(triples: oxigraph.Quad[]) {
//         triples.forEach((triple) => {
//             this.store!.add(triple);
//         });
//         this.report();
//     }

//     public report() {
//         console.log(this.store!.size);
//     }
// }

// export { TriplesStore };

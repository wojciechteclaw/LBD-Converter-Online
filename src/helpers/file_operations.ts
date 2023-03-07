class FileOperations {
    public static async getFileBuffer(file: File): Promise<Uint8Array> {
        let fileBuffer = await this.readInputFile(file);
        return new Uint8Array(fileBuffer);
    }

    private static async readInputFile(file: File): Promise<ArrayBuffer> {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onloadend = (e) => resolve((e.target as FileReader).result as ArrayBuffer);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }
}

export { FileOperations };

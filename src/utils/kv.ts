import fs from 'fs';
import path from 'path';

interface KVStore {
    [key: string]: any;
}

export class KV {
    private kvStore: KVStore = {};
    private filePath: string;

    constructor(file: string) {
        this.filePath = path.join(__dirname, file);
        this.loadKV();
    }

    // Load the Key-Value store from a file
    private loadKV() {
        if (fs.existsSync(this.filePath)) {
            const data = fs.readFileSync(this.filePath, 'utf-8');
            this.kvStore = JSON.parse(data);
        } else {
            fs.writeFileSync(this.filePath, JSON.stringify({}));
        }
    }

    // Save the Key-Value store to a file
    private saveKV() {
        fs.writeFileSync(this.filePath, JSON.stringify(this.kvStore, null, 2));
    }

    // Get a value by key
    get(key: string): any {
        return this.kvStore[key] || null;
    }

    // Set a value by key
    set(key: string, value: any): void {
        this.kvStore[key] = value;
        this.saveKV();
    }

    // Delete a value by key
    delete(key: string): void {
        delete this.kvStore[key];
        this.saveKV();
    }
}

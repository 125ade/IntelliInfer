import * as fs from 'fs';
import * as unzipper from 'unzipper';
import path from 'path';

// Function to control if a file is an image
export function isImage(fileName: string): boolean {
    const mimetype = "image/" + getFileExtension(fileName); // obtains image mimetype
    return isValidImageMimetype(mimetype); 
}
  
// Function to obtain file extension
export function getFileExtension(fileName: string): string {
    return fileName.split('.').pop() || ''; // Ottiene l'estensione del file
}
  
// Function to control if a mimetype is valid for an image
export function isValidImageMimetype(mimetype: string): boolean {
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/svg+xml'];
    return validMimeTypes.includes(mimetype); // Controlla se il mimetype è incluso nella lista dei mime types validi
}


// Function to unzip a file of images
export async function unzipImages(zipFilePath: string): Promise<Buffer[]> {
    let bufferList: Buffer[] = [];

    // Leggi il file zip nel buffer
    const zipBuffer = fs.readFileSync(zipFilePath);
  
    // from a stream retrieves all the file entries
    return new Promise((resolve, reject) => {
      const zipStream = unzipper.Open.buffer(zipBuffer);

      zipStream.then((directory: any) => {
        directory.files.forEach(async (file: any) => {
            const fileBuffer = await file.buffer();
            bufferList.push(fileBuffer);
        });

        resolve(bufferList);
      })
    });
}

// funzione che genera un path
export async function generatePath(name: string): Promise<string> {
    const basePath = '/path/to/datasets';
    return path.join(basePath, name);
}

 




      

import * as fs from 'fs';
import * as unzipper from 'unzipper'; // NB da mettere nelle dipendenze

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
export async function unzipImages(stream: any): Promise<Buffer[]> {
    let bufferList: Buffer[] = [];
  
    // from a stream retrieves all the file entries
    return await new Promise((resolve, reject) => {
      stream
        .pipe(unzipper.Parse())
        .on("entry", async (entry: unzipper.Entry) => {
          const TYPE = entry.type; // 'Directory' or 'File'
          if (TYPE === "File") {
            bufferList.push(await entry.buffer());
          } else entry.autodrain();
        })
        .on("close", () => {
          resolve(bufferList);
        })
        .on("error", (error: any) => reject(error));
    });
}


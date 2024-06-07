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

export function checkMimeType(nameFile: string): string {
    const extension = nameFile.split('.').pop()?.toLowerCase();

    if (!extension) {
        return "Estensione del file non valida.";
    }

    switch (extension) {
        case "jpg":
        case "jpeg":
        case "png":
        case "gif":
            return "img";
        case "zip":
            return "zip";
        default:
            return "Other";
    }
}

export interface SuccessResponse {
    success: boolean;
    message?: string;
    obj?: Object;
}

// NB: to move into utils.ts
export function generatePath(name: string): string {

        // Rimuove spazi vuoti e caratteri speciali dal nome
        const sanitizedName: string = name.replace(/[^a-zA-Z0-9]/g, '');

        // Converte il nome in lowercase e sostituisci gli spazi con trattini
        const formattedName: string = sanitizedName.toLowerCase().replace(/\s+/g, '-');

        // Costruisce il percorso con il nome formattato
        const path: string = `/path/${formattedName}`;

        return path;
    }


 




      

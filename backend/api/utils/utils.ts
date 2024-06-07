export interface SuccessResponse {
    success: boolean;
    message?: string;
    obj?: object;
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


 




      

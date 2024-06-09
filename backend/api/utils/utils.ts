export interface SuccessResponse {
    success: boolean;
    message?: string;
    obj?: object;
}

// function that generates dataset's path given its name
export function generatePath(name: string): string {
        const sanitizedName: string = name.replace(/[^a-zA-Z0-9]/g, '');
        const formattedName: string = sanitizedName.toLowerCase().replace(/\s+/g, '-');
        const path: string = `/${formattedName}`;
        return path;
}


 




      

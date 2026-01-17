import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    constructor() {}

    /**
     * Convert file to Base64 string
     * @param orderId - Order ID
     * @param file - File to convert
     * @returns Observable with Base64 string
     */
    uploadDocument(orderId: string, file: File): Observable<string> {
        return from(this.fileToBase64(file));
    }

    /**
     * Convert receipt to Base64
     * @param orderId - Order ID
     * @param file - Receipt file
     * @returns Observable with Base64 string
     */
    uploadReceipt(orderId: string, file: File): Observable<string> {
        return from(this.fileToBase64(file));
    }

    /**
     * Convert GCash QR code to Base64
     * @param file - QR code file
     * @returns Observable with Base64 string
     */
    uploadGCashQR(file: File): Observable<string> {
        return from(this.fileToBase64(file));
    }

    /**
     * Convert file to Base64 string (data URL format)
     */
    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = () => {
                const result = reader.result as string;
                console.log('[FileUploadService] File converted to Base64:', {
                    fileName: file.name,
                    fileSize: file.size,
                    base64Length: result.length
                });
                resolve(result); // Returns data:application/pdf;base64,...
            };

            reader.onerror = (error) => {
                console.error('[FileUploadService] Error converting file to Base64:', error);
                reject(error);
            };

            reader.readAsDataURL(file);
        });
    }

    /**
     * Validate file type
     * @param file - File to validate
     * @param allowedTypes - Array of allowed MIME types
     * @returns boolean
     */
    validateFileType(file: File, allowedTypes: string[]): boolean {
        return allowedTypes.includes(file.type);
    }

    /**
     * Validate file size (Base64 encoding increases size by ~33%)
     * @param file - File to validate
     * @param maxSizeMB - Maximum size in MB
     * @returns boolean
     */
    validateFileSize(file: File, maxSizeMB: number): boolean {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        // Base64 increases size by 33%, so we need stricter validation
        const estimatedBase64Size = (file.size * 4) / 3;
        return estimatedBase64Size <= maxSizeBytes;
    }

    /**
     * Get allowed document types
     */
    getAllowedDocumentTypes(): string[] {
        return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    }
}

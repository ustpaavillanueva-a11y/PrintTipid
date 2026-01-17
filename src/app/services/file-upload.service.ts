import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    // Cloudinary configuration
    private cloudName = 'djlpxyegi'; // Your Cloudinary Cloud Name
    private uploadPreset = 'printipid_uploads'; // Your upload preset

    constructor() {}

    /**
     * Upload document file for an order using Cloudinary
     * @param orderId - Order ID
     * @param file - File to upload
     * @returns Observable with download URL
     */
    uploadDocument(orderId: string, file: File): Observable<string> {
        return from(this.uploadToCloudinary(file, 'documents'));
    }

    /**
     * Upload payment receipt using Cloudinary
     * @param orderId - Order ID
     * @param file - Receipt image file
     * @returns Observable with download URL
     */
    uploadReceipt(orderId: string, file: File): Observable<string> {
        return from(this.uploadToCloudinary(file, 'receipts'));
    }

    /**
     * Upload GCash QR code (admin only)
     * @param file - QR code image
     * @returns Observable with download URL
     */
    uploadGCashQR(file: File): Observable<string> {
        return from(this.uploadToCloudinary(file, 'gcash-qr'));
    }

    /**
     * Main Cloudinary upload function
     */
    private uploadToCloudinary(file: File, folder: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', this.uploadPreset);
            formData.append('folder', folder);

            fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/auto/upload`, {
                method: 'POST',
                body: formData
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.error) {
                        reject(new Error(data.error.message));
                    } else {
                        resolve(data.secure_url); // Returns HTTPS URL
                    }
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Delete file from Cloudinary
     * @param publicId - Cloudinary public ID
     * @returns Observable<void>
     */
    deleteFile(publicId: string): Observable<void> {
        return from(
            fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/resources/image/upload`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer YOUR_API_TOKEN` // You'll need API token for deletion
                }
            }).then(() => {})
        );
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
     * Validate file size
     * @param file - File to validate
     * @param maxSizeMB - Maximum size in MB
     * @returns boolean
     */
    validateFileSize(file: File, maxSizeMB: number): boolean {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        return file.size <= maxSizeBytes;
    }

    /**
     * Get allowed document types
     */
    getAllowedDocumentTypes(): string[] {
        return ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png', 'image/jpg'];
    }

    /**
     * Get allowed image types (for receipts/QR)
     */
    getAllowedImageTypes(): string[] {
        return ['image/jpeg', 'image/png', 'image/jpg'];
    }
}

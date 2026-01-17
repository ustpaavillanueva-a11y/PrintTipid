import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL, deleteObject, UploadResult } from '@angular/fire/storage';
import { Observable, from, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    constructor(private storage: Storage) {}

    /**
     * Upload document file for an order
     * @param orderId - Order ID
     * @param file - File to upload
     * @returns Observable with download URL
     */
    uploadDocument(orderId: string, file: File): Observable<string> {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const filePath = `documents/${orderId}/${fileName}`;
        const storageRef = ref(this.storage, filePath);

        return from(uploadBytes(storageRef, file)).pipe(switchMap((result: UploadResult) => getDownloadURL(result.ref)));
    }

    /**
     * Upload payment receipt
     * @param orderId - Order ID
     * @param file - Receipt image file
     * @returns Observable with download URL
     */
    uploadReceipt(orderId: string, file: File): Observable<string> {
        const timestamp = Date.now();
        const fileName = `receipt_${timestamp}_${file.name}`;
        const filePath = `receipts/${orderId}/${fileName}`;
        const storageRef = ref(this.storage, filePath);

        return from(uploadBytes(storageRef, file)).pipe(switchMap((result: UploadResult) => getDownloadURL(result.ref)));
    }

    /**
     * Upload GCash QR code (admin only)
     * @param file - QR code image
     * @returns Observable with download URL
     */
    uploadGCashQR(file: File): Observable<string> {
        const timestamp = Date.now();
        const fileName = `gcash_qr_${timestamp}.png`;
        const filePath = `payment-configs/${fileName}`;
        const storageRef = ref(this.storage, filePath);

        return from(uploadBytes(storageRef, file)).pipe(switchMap((result: UploadResult) => getDownloadURL(result.ref)));
    }

    /**
     * Delete file from storage
     * @param fileUrl - Full download URL
     * @returns Observable<void>
     */
    deleteFile(fileUrl: string): Observable<void> {
        const storageRef = ref(this.storage, fileUrl);
        return from(deleteObject(storageRef));
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

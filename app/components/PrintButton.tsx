'use client';

import { useCallback } from 'react';

interface PrintButtonProps {
    /**
     * The type of voucher to print. Determines which element is targeted.
     * Provide a matching DOM id in the page (e.g., "customer-voucher" or "driver-voucher").
     */
    voucherType?: 'customer' | 'driver';
    /**
     * Optional DOM id of the element to print. If not provided, the whole page is printed.
     */
    elementId?: string;
}

export default function PrintButton({ voucherType = 'customer', elementId }: PrintButtonProps) {
    const handlePrint = useCallback(() => {
        if (elementId) {
            const element = document.getElementById(elementId);
            if (!element) {
                console.warn(`PrintButton: No element found with id '${elementId}'. Falling back to full page print.`);
                window.print();
                return;
            }
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                console.error('PrintButton: Unable to open print window.');
                return;
            }
            const style = document.createElement('style');
            style.innerHTML = `@media print { body { -webkit-print-color-adjust: exact; } button { display: none; } }`;
            printWindow.document.head.appendChild(style);
            printWindow.document.body.innerHTML = element.outerHTML;
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
        } else {
            window.print();
        }
    }, [elementId]);

    return (
        <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
            Yazdır
        </button>
    );
}

import Image from 'next/image';

interface VoucherHeaderProps {
    voucherNumber: string;
    isDriverVoucher?: boolean;
}

export function VoucherHeader({ voucherNumber, isDriverVoucher = false }: VoucherHeaderProps) {
    return (
        <div className="text-center mb-4 border-b border-gray-200 dark:border-slate-700 pb-4 print:hidden transition-colors duration-200">
            <div className="flex justify-center items-center gap-3 mb-4">
                <Image
                    src="/crmlogo/proAcentelogo-symbol.png"
                    alt="Pro Acente logo"
                    width={52}
                    height={52}
                    className="h-11 w-11 object-contain"
                    priority
                />
                <span className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">Pro Acente</span>
            </div>
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                {isDriverVoucher ? 'Şoför Voucherı' : 'Müşteri Voucherı'}
            </h1>
            <div className="text-gray-600 dark:text-slate-300 text-sm font-medium transition-colors duration-200">
                Voucher No: {voucherNumber}
            </div>
        </div>
    );
} 
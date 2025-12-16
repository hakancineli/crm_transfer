'use client';

import { useState, useEffect } from 'react';

interface SeatMapProps {
    capacity: number;
    occupiedSeats: string[]; // Array of seat numbers
    selectedSeat: string | null;
    onSelect: (seatNumber: string) => void;
    vehicleType?: string;
}

export default function SeatMap({ capacity, occupiedSeats, selectedSeat, onSelect, vehicleType }: SeatMapProps) {
    // Generate seat layout based on capacity
    // This is a simplified layout generator. 
    // For a real bus, we might need specific templates (e.g., 2+1, 2+2).
    // Here we assume a standard 2+1 or 2+2 layout depending on size.

    const renderSeat = (seatNum: number) => {
        const seatStr = seatNum.toString();
        const isOccupied = occupiedSeats.includes(seatStr);
        const isSelected = selectedSeat === seatStr;

        let seatColor = "bg-white border-gray-300 hover:border-blue-500 text-gray-700";
        if (isOccupied) seatColor = "bg-red-100 border-red-300 text-red-400 cursor-not-allowed";
        if (isSelected) seatColor = "bg-blue-600 border-blue-600 text-white";

        return (
            <button
                key={seatNum}
                type="button"
                disabled={isOccupied}
                onClick={() => onSelect(seatStr)}
                className={`w-10 h-10 m-1 rounded-t-lg border-2 flex items-center justify-center font-bold text-sm transition-colors ${seatColor}`}
                title={isOccupied ? 'Dolu' : `Koltuk ${seatNum}`}
            >
                {seatNum}
            </button>
        );
    };

    const renderLayout = () => {
        // Determine layout strategy
        // Small (Vito): 6-8 seats
        // Medium (Sprinter): 10-19 seats
        // Large (Bus): 20+ seats

        const rows = [];
        let seatsPerRow = 3; // Default for Sprinter (1+2)
        let aisleIndex = 1;  // Gap after 1st seat

        if (capacity > 20) {
            seatsPerRow = 4; // 2+2 for bus
            aisleIndex = 2;
        } else if (capacity <= 8) {
            seatsPerRow = 3;
            aisleIndex = -1; // No aisle, just rows
        }

        // Helper to group seats into rows
        let currentSeat = 1;
        const totalRows = Math.ceil(capacity / seatsPerRow);

        return (
            <div className="flex flex-col gap-2 p-4 bg-gray-100 rounded-lg border border-gray-300 max-w-xs mx-auto">
                {/* Driver Area */}
                <div className="flex justify-start mb-4 border-b-2 border-dashed border-gray-300 pb-2">
                    <div className="w-10 h-10 border-2 border-gray-400 rounded-full flex items-center justify-center bg-gray-200 text-xs font-bold text-gray-600">
                        ŞOFÖR
                    </div>
                </div>

                {/* Seats */}
                <div className="flex flex-col gap-2">
                    {Array.from({ length: totalRows }).map((_, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center gap-2">
                            {Array.from({ length: seatsPerRow }).map((_, colIndex) => {
                                if (currentSeat > capacity) return <div key={`empty-${colIndex}`} className="w-10 h-10 m-1" />;

                                // Add aisle gap
                                if (colIndex === aisleIndex && aisleIndex !== -1) {
                                    const seat = renderSeat(currentSeat++);
                                    return (
                                        <div key={currentSeat - 1} className="flex">
                                            <div className="w-4"></div> {/* Aisle */}
                                            {seat}
                                        </div>
                                    );
                                }

                                return renderSeat(currentSeat++);
                            })}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-4 flex gap-4 text-xs justify-center border-t pt-2">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-white border border-gray-300"></div>
                        <span>Boş</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-blue-600"></div>
                        <span>Seçili</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
                        <span>Dolu</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex justify-center">
            {renderLayout()}
        </div>
    );
}

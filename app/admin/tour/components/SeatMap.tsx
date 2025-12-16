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

        let seatColor = "stroke-gray-400 fill-white text-gray-700 hover:fill-blue-50";
        if (isOccupied) seatColor = "stroke-red-400 fill-red-100 text-red-500 cursor-not-allowed";
        if (isSelected) seatColor = "stroke-blue-600 fill-blue-600 text-white";

        return (
            <button
                key={seatNum}
                type="button"
                disabled={isOccupied}
                onClick={() => onSelect(seatStr)}
                className="relative group p-1"
                title={isOccupied ? `Koltuk ${seatNum} (Dolu)` : `Koltuk ${seatNum}`}
            >
                {/* SVG Seat Icon */}
                <svg width="40" height="40" viewBox="0 0 100 100" className={`transition-colors ${seatColor}`}>
                    <path d="M 20 20 L 80 20 C 90 20 90 30 90 40 L 90 80 C 90 90 80 90 70 90 L 30 90 C 20 90 10 90 10 80 L 10 40 C 10 30 10 20 20 20 Z" strokeWidth="6" />
                    {/* Armrests */}
                    <path d="M 10 50 L 10 80" strokeWidth="6" />
                    <path d="M 90 50 L 90 80" strokeWidth="6" />
                </svg>
                <span className={`absolute inset-0 flex items-center justify-center font-bold text-xs ${isSelected ? 'text-white' : (isOccupied ? 'text-red-500' : 'text-gray-600')}`}>
                    {seatNum}
                </span>
            </button>
        );
    };

    const renderLayout = () => {
        const rows = [];
        let seatsPerRow = 3;
        let aisleIndex = 1;

        if (capacity > 20) {
            seatsPerRow = 4; // 2+2 for bus
            aisleIndex = 2; // Index 0,1 | 2,3
        } else if (capacity <= 8) {
            seatsPerRow = 3;
            aisleIndex = -1;
        }

        let currentSeat = 1;
        // Logic to handle back row often having 5 seats in 2+2 configs
        // If capacity % 4 !== 0, usually the last row is full 5. 
        // But for simplicity, we map strictly until capacity reached.

        const seatGrid = [];
        while (currentSeat <= capacity) {
            const rowSeats = [];
            // Special handling for last row if it's a 2+2 bus and we are at the end
            // Usually buses are:
            // 2+2
            // 2+2
            // ...
            // 5 (Back row)

            // For now, standard grid generation:
            for (let i = 0; i < seatsPerRow; i++) {
                // If it's a bus (seatsPerRow=4) and we are creating columns
                // 0, 1 (Left) | Aisle | 2, 3 (Right)

                // Add aisle gap before index 2 (if aisle exists)
                if (i === aisleIndex && aisleIndex !== -1) {
                    rowSeats.push(<div key={`aisle-${currentSeat}`} className="w-6"></div>);
                }

                if (currentSeat <= capacity) {
                    rowSeats.push(renderSeat(currentSeat));
                    currentSeat++;
                } else {
                    // Empty spacer
                    rowSeats.push(<div key={`empty-${i}`} className="w-10 h-10 m-1"></div>);
                }
            }
            seatGrid.push(<div key={seatGrid.length} className="flex justify-center">{rowSeats}</div>);
        }

        return (
            <div className="flex flex-col gap-1 p-4 bg-white rounded-lg border border-gray-300 max-w-sm mx-auto shadow-sm">
                {/* Driver Area */}
                <div className="flex justify-start mb-6 border-b border-gray-100 pb-4">
                    <div className="flex flex-col items-center">
                        <svg width="40" height="40" viewBox="0 0 100 100" className="stroke-gray-400 fill-gray-200">
                            <circle cx="50" cy="50" r="40" strokeWidth="4" />
                            <path d="M 50 10 L 50 90" strokeWidth="4" />
                            <path d="M 10 50 L 90 50" strokeWidth="4" />
                        </svg>
                        <span className="text-[10px] font-bold text-gray-500 mt-1">ŞOFÖR</span>
                    </div>
                </div>

                {/* Seats Container */}
                <div className="flex flex-col gap-2">
                    {seatGrid}
                </div>

                {/* Legend */}
                <div className="mt-6 flex gap-4 text-xs justify-center border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded border border-gray-400 bg-white"></div>
                        <span>Boş</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded bg-blue-600"></div>
                        <span>Seçili</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded border border-red-300 bg-red-100"></div>
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

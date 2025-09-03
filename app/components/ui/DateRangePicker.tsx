'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DateRangePickerProps {
    value: { from: Date; to: Date };
    onChange: (value: { from: Date; to: Date }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const [date, setDate] = useState<{ from: Date; to: Date }>(value);

    return (
        <div className="grid gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "dd MMM yyyy", { locale: tr })} -{" "}
                                    {format(date.to, "dd MMM yyyy", { locale: tr })}
                                </>
                            ) : (
                                format(date.from, "dd MMM yyyy", { locale: tr })
                            )
                        ) : (
                            <span>Tarih aralığı seçin</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto">
                    <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={{ from: date.from, to: date.to }}
                        onSelect={(newDate: any) => {
                            if (newDate?.from && newDate?.to) {
                                const updatedDate = {
                                    from: newDate.from,
                                    to: newDate.to
                                };
                                setDate(updatedDate);
                                onChange(updatedDate);
                            }
                        }}
                        numberOfMonths={1}
                        locale={tr}
                        className="rounded-md border"
                        classNames={{
                            months: "space-y-4",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-sm font-medium",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
                            day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                            day_range_end: "day-range-end",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            day_today: "bg-accent text-accent-foreground",
                            day_outside: "text-muted-foreground opacity-50",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            day_hidden: "invisible",
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
} 
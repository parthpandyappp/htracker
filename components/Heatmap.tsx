"use client";

import { DayCell, MonthLabel, WEEKDAY_LABELS } from "@/lib/heatmap";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const CELL_SIZE = 12;
const CELL_GAP = 4;
const COLUMN_WIDTH = CELL_SIZE + CELL_GAP;

function formatFullDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function Heatmap({
  weeks,
  monthLabels,
  checkedKeys,
  pendingKeys,
  todayKey,
  onToggle,
}: {
  weeks: DayCell[][];
  monthLabels: MonthLabel[];
  checkedKeys: Set<string>;
  pendingKeys?: Set<string>;
  todayKey: string;
  onToggle: (cell: DayCell) => void;
}) {
  const gridWidth = weeks.length * COLUMN_WIDTH;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="inline-flex gap-2">
        {/* weekday labels */}
        <div
          className="flex flex-col gap-1 pt-[20px] text-[10px] leading-none text-muted-foreground"
          style={{ height: 7 * COLUMN_WIDTH }}
        >
          {WEEKDAY_LABELS.map((label, idx) => (
            <div key={label} style={{ height: CELL_SIZE }} className="flex items-center">
              {idx % 2 === 1 ? label.slice(0, 3) : ""}
            </div>
          ))}
        </div>

        <div>
          {/* month labels */}
          <div className="relative mb-1.5" style={{ width: gridWidth, height: 14 }}>
            {monthLabels.map((m) => (
              <span
                key={`${m.weekIndex}-${m.label}`}
                className="absolute top-0 text-[11px] text-muted-foreground"
                style={{ left: m.weekIndex * COLUMN_WIDTH }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* weeks grid */}
          <div className="flex gap-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((cell) => {
                  const isChecked = checkedKeys.has(cell.key);
                  const isPending = pendingKeys?.has(cell.key);
                  const isFuture = cell.key > todayKey;

                  if (isFuture) {
                    return (
                      <div
                        key={cell.key}
                        className="rounded-[3px] bg-foreground/[0.04] ring-1 ring-inset ring-foreground/[0.04]"
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      />
                    );
                  }

                  return (
                    <Tooltip key={cell.key}>
                      <TooltipTrigger
                        onClick={() => onToggle(cell)}
                        aria-label={`${formatFullDate(cell.date)}: ${
                          isChecked ? "checked in" : "not checked in"
                        }`}
                        className={`block appearance-none rounded-[3px] border-0 p-0 outline-none ring-1 ring-inset transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                          isChecked
                            ? "bg-green-500 ring-green-600/30 hover:bg-green-600"
                            : "bg-foreground/[0.07] ring-foreground/[0.08] hover:bg-foreground/15"
                        } ${isPending ? "opacity-50" : ""}`}
                        style={{ width: CELL_SIZE, height: CELL_SIZE }}
                      />
                      <TooltipContent>
                        {isChecked ? "Checked in" : "No check-in"} · {formatFullDate(cell.date)}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Less</span>
        <span
          className="block rounded-[3px] bg-foreground/[0.07] ring-1 ring-inset ring-foreground/[0.08]"
          style={{ width: CELL_SIZE, height: CELL_SIZE }}
        />
        <span className="block rounded-[3px] bg-green-500" style={{ width: CELL_SIZE, height: CELL_SIZE }} />
        <span>More</span>
      </div>
    </div>
  );
}

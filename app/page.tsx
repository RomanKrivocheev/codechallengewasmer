'use client';

import { useEffect, useState } from 'react';

export type EventInput = { start: number; end: number };
export type PositionedEvent = EventInput & { column: number };

const TOTAL_MINUTES = 12 * 60;
const CONTAINER_HEIGHT = 720;
const MINUTE_TO_PX = CONTAINER_HEIGHT / TOTAL_MINUTES;

const TIME_COL_WIDTH = 80;
const GRID_WIDTH = 620;
const GRID_LEFT = TIME_COL_WIDTH;
const OUTER_WIDTH = TIME_COL_WIDTH + GRID_WIDTH;

const GRID_PADDING_X = 10;
const EVENTS_AREA_WIDTH = GRID_WIDTH - GRID_PADDING_X * 2;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(value, max));

const collides = (a: EventInput, b: EventInput) =>
  !(a.end <= b.start || b.end <= a.start);

const assignColumns = (events: EventInput[]): PositionedEvent[] => {
  const sorted = [...events].sort((a, b) => a.start - b.start);
  const columns: EventInput[][] = [];

  return sorted.map((event) => {
    let placed = false;
    let colIndex = 0;

    for (let i = 0; i < columns.length; i++) {
      if (!columns[i].some((e) => collides(e, event))) {
        columns[i].push(event);
        colIndex = i;
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([event]);
      colIndex = columns.length - 1;
    }

    return { ...event, column: colIndex };
  });
};

const formatHourLabel = (hour: number) => {
  const h12 = hour === 12 ? 12 : hour % 12;
  const suffix = hour < 12 ? 'AM' : 'PM';
  return { time: `${h12}:00`, suffix };
};

const formatHalfHourLabel = (fractionalHour: number) => {
  const base = Math.floor(fractionalHour);
  const h12 = base === 12 ? 12 : base % 12;
  return `${h12}:30`;
};

export default function Home() {
  const [positionedEvents, setEvents] = useState<PositionedEvent[]>([]);

  useEffect(() => {
    (window as any).layOutDay = (events: EventInput[]) => {
      setEvents(assignColumns(events));
    };
  }, []);

  const columnCount =
    positionedEvents.length > 0
      ? Math.max(...positionedEvents.map((e) => e.column)) + 1
      : 1;

  const columnWidth = EVENTS_AREA_WIDTH / columnCount;

  const hours = Array.from({ length: 13 }, (_, i) => 9 + i);
  const halfHours = Array.from({ length: 12 }, (_, i) => 9.5 + i);

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div
        className="relative bg-white pl-2"
        style={{ width: OUTER_WIDTH, height: CONTAINER_HEIGHT }}
      >
        <div
          className="absolute"
          style={{
            left: GRID_LEFT,
            top: 0,
            width: GRID_WIDTH,
            height: CONTAINER_HEIGHT,
            backgroundColor: '#f3f3f3',
          }}
        />

        {hours.map((hour) => {
          const y = (hour - 9) * 60 * MINUTE_TO_PX;
          const { time, suffix } = formatHourLabel(hour);

          return (
            <div
              key={hour}
              className="absolute text-[11px] text-gray-700 pr-2 text-right"
              style={{
                top: y - 8,
                left: 0,
                width: TIME_COL_WIDTH - 4,
              }}
            >
              <span className="font-semibold">{time}</span>{' '}
              <span className="text-[10px] font-normal text-gray-500">
                {suffix}
              </span>
            </div>
          );
        })}

        {halfHours.map((fh, idx) => {
          const y = (fh - 9) * 60 * MINUTE_TO_PX;
          return (
            <div
              key={`half-${idx}`}
              className="absolute text-[10px] text-gray-400 pr-2 text-right"
              style={{
                top: y - 6,
                left: 0,
                width: TIME_COL_WIDTH - 4,
              }}
            >
              {formatHalfHourLabel(fh)}
            </div>
          );
        })}

        {positionedEvents.map((event, idx) => {
          const start = clamp(event.start, 0, TOTAL_MINUTES);
          const end = clamp(event.end, 0, TOTAL_MINUTES);
          const top = start * MINUTE_TO_PX;
          const height = Math.max(10, (end - start) * MINUTE_TO_PX);

          const titleText = 'Sample Item';
          const subtitleText = 'Sample Location';

          const isTooNarrow = columnWidth < 40;
          const isTooShort = height < 20;
          const showInlineText = !(isTooNarrow || isTooShort);

          return (
            <div
              key={idx}
              className="
  absolute group bg-white 
  border border-gray-300 
  border-l-4 border-l-blue-700
  rounded-sm 
  px-3 py-2 text-[11px] shadow-sm cursor-pointer
"
              style={{
                top,
                height,
                left: GRID_LEFT + GRID_PADDING_X + event.column * columnWidth,
                width: columnWidth - 4,
              }}
            >
              {showInlineText && (
                <>
                  <div className="font-semibold text-blue-700 whitespace-nowrap overflow-hidden text-ellipsis">
                    {titleText}
                  </div>
                  <div className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">
                    {subtitleText}
                  </div>
                </>
              )}

              <div
                className="
                  pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2 
                  z-10 hidden group-hover:block bg-white border border-gray-300 
                  rounded px-2 py-1 text-[11px] shadow-lg
                "
              >
                <div className="font-semibold text-blue-700">{titleText}</div>
                <div className="text-gray-600">{subtitleText}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

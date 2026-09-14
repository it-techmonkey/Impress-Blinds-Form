"use client";

export type ControlType = "T" | "FF";

export type MeasurementRowDraft = {
  key: string;
  area: string;
  widthMm: string;
  dropMm: string;
  chainCordControl: string;
  wandControl: string;
  control: ControlType | "";
  comments: string;
};

export function newMeasurementRow(): MeasurementRowDraft {
  return {
    key: crypto.randomUUID(),
    area: "",
    widthMm: "",
    dropMm: "",
    chainCordControl: "",
    wandControl: "",
    control: "",
    comments: "",
  };
}

const cellInputClass = "w-full border-0 bg-transparent p-1.5 text-sm outline-none focus:bg-yellow-50";

function Th({
  children,
  className = "",
  colSpan,
  rowSpan,
}: {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
  rowSpan?: number;
}) {
  return (
    <th
      colSpan={colSpan}
      rowSpan={rowSpan}
      className={`border border-gray-400 bg-gray-100 px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-700 ${className}`}
    >
      {children}
    </th>
  );
}

export function MeasurementRowsEditor({
  rows,
  onChange,
}: {
  rows: MeasurementRowDraft[];
  onChange: (rows: MeasurementRowDraft[]) => void;
}) {
  function updateRow(key: string, patch: Partial<MeasurementRowDraft>) {
    onChange(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  }

  function removeRow(key: string) {
    onChange(rows.filter((row) => row.key !== key));
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-x-auto rounded-sm border border-gray-400">
        <table className="w-full min-w-190 border-collapse">
          <thead>
            <tr>
              <Th className="w-8" rowSpan={2}>#</Th>
              <Th className="w-32" rowSpan={2}>Area</Th>
              <Th className="w-16" rowSpan={2}>W</Th>
              <Th className="w-16" rowSpan={2}>D</Th>
              <Th className="w-28" rowSpan={2}>Chain &amp; Cord Control</Th>
              <Th className="w-24" rowSpan={2}>Wand Control</Th>
              <Th className="w-24" colSpan={2}>Control</Th>
              <Th rowSpan={2}>Comments</Th>
              <Th className="w-10" rowSpan={2}> </Th>
            </tr>
            <tr>
              <Th className="w-12">T</Th>
              <Th className="w-12">FF</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.key} className="even:bg-gray-50">
                <td className="border border-gray-300 px-1.5 py-1 text-center text-sm font-semibold text-gray-500">
                  {index + 1}
                </td>
                <td className="border border-gray-300">
                  <input
                    className={cellInputClass}
                    value={row.area}
                    onChange={(e) => updateRow(row.key, { area: e.target.value })}
                    placeholder="Room name"
                  />
                </td>
                <td className="border border-gray-300">
                  <input
                    className={cellInputClass}
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={row.widthMm}
                    onChange={(e) => updateRow(row.key, { widthMm: e.target.value })}
                  />
                </td>
                <td className="border border-gray-300">
                  <input
                    className={cellInputClass}
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={row.dropMm}
                    onChange={(e) => updateRow(row.key, { dropMm: e.target.value })}
                  />
                </td>
                <td className="border border-gray-300">
                  <input
                    className={cellInputClass}
                    value={row.chainCordControl}
                    onChange={(e) => updateRow(row.key, { chainCordControl: e.target.value })}
                    placeholder="Chain side / type"
                  />
                </td>
                <td className="border border-gray-300">
                  <input
                    className={cellInputClass}
                    value={row.wandControl}
                    onChange={(e) => updateRow(row.key, { wandControl: e.target.value })}
                  />
                </td>
                <td className="border border-gray-300 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-gray-800"
                    checked={row.control === "T"}
                    onChange={(e) => updateRow(row.key, { control: e.target.checked ? "T" : "" })}
                    aria-label={`Row ${index + 1}: control T`}
                  />
                </td>
                <td className="border border-gray-300 text-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-gray-800"
                    checked={row.control === "FF"}
                    onChange={(e) => updateRow(row.key, { control: e.target.checked ? "FF" : "" })}
                    aria-label={`Row ${index + 1}: control FF`}
                  />
                </td>
                <td className="border border-gray-300">
                  <input
                    className={cellInputClass}
                    value={row.comments}
                    onChange={(e) => updateRow(row.key, { comments: e.target.value })}
                    placeholder="Fabric, colour, notes"
                  />
                </td>
                <td className="border border-gray-300 text-center">
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.key)}
                      aria-label={`Remove row ${index + 1}`}
                      className="px-1.5 text-sm font-bold text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-gray-400 sm:hidden">Scroll sideways to see all columns →</p>
      <button
        type="button"
        onClick={() => onChange([...rows, newMeasurementRow()])}
        className="rounded-sm border-2 border-dashed border-gray-400 py-2.5 text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-gray-700"
      >
        + Add Row
      </button>
    </div>
  );
}

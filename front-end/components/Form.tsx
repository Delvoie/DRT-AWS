import React, { useState, useEffect, useRef } from "react";

interface FormProps {
  name: string | number;
  id: number;
  age: Date;
  lastTimeWorkedOn: Date;
  busID?: number;
}

interface CSVRecord extends FormProps {
  _raw: string; // original CSV row for reference
}

// --- CSV Parser ---
function parseCSV(csvText: string): CSVRecord[] {
  const lines = csvText.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = values[i] ?? ""));

    return {
      name: isNaN(Number(row.name)) ? row.name : Number(row.name),
      id: Number(row.id),
      age: new Date(row.age),
      lastTimeWorkedOn: new Date(row.lastTimeWorkedOn),
      busID: row.busID ? Number(row.busID) : undefined,
      _raw: line,
    };
  });
}

// Gets unique names, keeping only the most recent record per name
function deduplicateByName(records: CSVRecord[]): CSVRecord[] {
  const map = new Map<string, CSVRecord>();

  for (const record of records) {
    const key = String(record.name).toLowerCase();
    const existing = map.get(key);

    if (
      !existing ||
      record.lastTimeWorkedOn > existing.lastTimeWorkedOn
    ) {
      map.set(key, record);
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  );
}

const toDateInput = (date: Date) =>
  date instanceof Date && !isNaN(date.getTime())
    ? date.toISOString().split("T")[0]
    : "";

const emptyForm = (): FormProps => ({
  name: "",
  id: 0,
  age: new Date(),
  lastTimeWorkedOn: new Date(),
  busID: undefined,
});

// --- Main Component ---
export default function Form(initialProps: Partial<FormProps>) {
  const [records, setRecords] = useState<CSVRecord[]>([]);
  const [uniqueRecords, setUniqueRecords] = useState<CSVRecord[]>([]);
  const [formData, setFormData] = useState<FormProps>({
    ...emptyForm(),
    ...initialProps,
  });
  const [showBusID, setShowBusID] = useState(initialProps.busID !== undefined);
  const [selectedName, setSelectedName] = useState<string>("__new__");
  const [isDirty, setIsDirty] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const deduped = deduplicateByName(records);
    setUniqueRecords(deduped);
  }, [records]);

  // Handle CSV file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSV(text);
      setRecords(parsed);
    };
    reader.readAsText(file);
  };

  // When a name is selected from the dropdown
  const handleNameSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedName(value);
    setIsDirty(false);

    if (value === "__new__") {
      setFormData(emptyForm());
      setShowBusID(false);
      return;
    }

    const match = uniqueRecords.find((r) => String(r.name) === value);
    if (match) {
      setFormData({
        name: match.name,
        id: match.id,
        age: match.age,
        lastTimeWorkedOn: match.lastTimeWorkedOn,
        busID: match.busID,
      });
      setShowBusID(match.busID !== undefined);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setIsDirty(true);

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "date"
          ? new Date(value)
          : name === "id" || name === "busID"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted:", formData);
    // TODO: wire to your save/export logic
  };

  const handleClear = () => {
    setFormData(emptyForm());
    setSelectedName("__new__");
    setShowBusID(false);
    setIsDirty(false);
  };

  return (
    <div className="form-container">

      {/* CSV Upload */}
      <div className="field">
        <label>Load from CSV</label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
        />
        {records.length > 0 && (
          <span className="hint">
            {records.length} records loaded · {uniqueRecords.length} unique names
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit}>

        {/* Name Dropdown */}
        <div className="field">
          <label htmlFor="nameSelect">Name</label>
          <select
            id="nameSelect"
            value={selectedName}
            onChange={handleNameSelect}
          >
            <option value="__new__">+ Add new entry</option>
            {uniqueRecords.map((r) => (
              <option key={r.id} value={String(r.name)}>
                {String(r.name)}
              </option>
            ))}
          </select>
          {isDirty && selectedName !== "__new__" && (
            <span className="hint warning">
              Fields have been modified from the loaded record
            </span>
          )}
        </div>

        {/* Name text input — editable even when prefilled */}
        <div className="field">
          <label htmlFor="name">Name value</label>
          <input
            id="name"
            name="name"
            type="text"
            value={String(formData.name)}
            onChange={handleChange}
            placeholder="Name or numeric ID"
          />
        </div>

        <div className="field">
          <label htmlFor="id">ID</label>
          <input
            id="id"
            name="id"
            type="number"
            value={formData.id}
            onChange={handleChange}
            placeholder="Unique crypto ID"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="age">Date of birth</label>
            <input
              id="age"
              name="age"
              type="date"
              value={toDateInput(formData.age)}
              onChange={handleChange}
            />
          </div>

          <div className="field">
            <label htmlFor="lastTimeWorkedOn">Last worked on</label>
            <input
              id="lastTimeWorkedOn"
              name="lastTimeWorkedOn"
              type="date"
              value={toDateInput(formData.lastTimeWorkedOn)}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={showBusID}
              onChange={(e) => {
                setShowBusID(e.target.checked);
                if (!e.target.checked)
                  setFormData((p) => ({ ...p, busID: undefined }));
              }}
            />
            {" "}Include bus ID{" "}
            <span className="optional-tag">optional</span>
          </label>

          {showBusID && (
            <input
              id="busID"
              name="busID"
              type="number"
              value={formData.busID ?? ""}
              onChange={handleChange}
              placeholder="Enter bus ID"
            />
          )}
        </div>

        <div className="actions">
          <button type="submit">Save record</button>
          <button type="button" onClick={handleClear}>Clear</button>
        </div>

      </form>
    </div>
  );
}
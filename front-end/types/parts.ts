// import React, { useState, useRef } from "react";

// // ---- Types ----

// export interface PMRecord {
//   cgdivision: string;
//   ownergroup: string;
//   pmnum: string;
//   pmdescription: string;
//   jpdescription: string;
//   nexttrigger: number;
//   unitstogo: number;
//   alias: string;
//   assetdescription: string;
//   locdescription: string;
//   metername: string;
//   lastreading: number;
//   pmstatus: string;
//   assetstatus: string;
//   assetnum: string;
//   frequency: number;
//   tolerance: number;
//   wonum: string;
//   wodescription: string;
//   reportdate: string;       // ISO datetime string
//   lastpmwogenread: number;
//   dayslate: number;
//   curjpdescription: string;
//   unitslate: number;
// }

// const FIELDS = [
//   "cgdivision","ownergroup","pmnum","pmdescription","jpdescription",
//   "nexttrigger","unitstogo","alias","assetdescription","locdescription",
//   "metername","lastreading","pmstatus","assetstatus","assetnum",
//   "frequency","tolerance","wonum","wodescription","reportdate",
//   "lastpmwogenread","dayslate","curjpdescription","unitslate",
// ] as const;

// type Field = typeof FIELDS[number];

// const NUM_FIELDS = new Set<Field>([
//   "nexttrigger","unitstogo","lastreading","frequency",
//   "tolerance","lastpmwogenread","dayslate","unitslate",
// ]);

// const emptyRecord = (): PMRecord =>
//   Object.fromEntries(FIELDS.map((f) => [f, ""])) as unknown as PMRecord;

// // ---- CSV Parser ----
// // Row 0 = headers, Row 1 = types (skipped), Row 2+ = data

// function parseCSV(text: string): PMRecord[] {
//   const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);
//   if (lines.length < 3) return [];

//   const headers = lines[0].split(",").map((h) => h.trim()) as Field[];

//   return lines.slice(2).map((line) => {
//     const values = line.split(",");
//     const row = emptyRecord();
//     headers.forEach((h, i) => {
//       const val = (values[i] ?? "").trim();
//       if (FIELDS.includes(h)) {
//         (row as Record<string, unknown>)[h] = NUM_FIELDS.has(h)
//           ? parseFloat(val) || 0
//           : val;
//       }
//     });
//     return row;
//   });
// }

// // Keep only the most recent record per alias (by reportdate)
// function deduplicateByAlias(records: PMRecord[]): Map<string, PMRecord> {
//   const map = new Map<string, PMRecord>();
//   for (const r of records) {
//     const key = r.alias.toLowerCase();
//     if (!key) continue;
//     const existing = map.get(key);
//     if (!existing || new Date(r.reportdate) > new Date(existing.reportdate)) {
//       map.set(key, r);
//     }
//   }
//   return map;
// }

// // ---- Form Component ----

// export default function PMForm() {
//   const [allRecords, setAllRecords] = useState<PMRecord[]>([]);
//   const [uniqueByAlias, setUniqueByAlias] = useState<Map<string, PMRecord>>(new Map());
//   const [formData, setFormData] = useState<PMRecord>(emptyRecord());
//   const [selectedAlias, setSelectedAlias] = useState<string>("__new__");
//   const [isDirty, setIsDirty] = useState(false);
//   const fileRef = useRef<HTMLInputElement>(null);

//   const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const text = evt.target?.result as string;
//       const records = parseCSV(text);
//       setAllRecords(records);
//       setUniqueByAlias(deduplicateByAlias(records));
//     };
//     reader.readAsText(file);
//   };

//   const handleAliasSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const val = e.target.value;
//     setSelectedAlias(val);
//     setIsDirty(false);
//     if (val === "__new__") {
//       setFormData(emptyRecord());
//       return;
//     }
//     const match = uniqueByAlias.get(val.toLowerCase());
//     if (match) setFormData({ ...match });
//   };

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setIsDirty(true);
//     setFormData((prev) => ({
//       ...prev,
//       [name]: NUM_FIELDS.has(name as Field) ? parseFloat(value) || 0 : value,
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Submitted:", formData);
//     // TODO: wire to your save/export logic
//   };

//   const handleClear = () => {
//     setFormData(emptyRecord());
//     setSelectedAlias("__new__");
//     setIsDirty(false);
//   };

//   const sortedAliases = [...uniqueByAlias.keys()].sort();
//   const activeCount = allRecords.filter(
//     (r) => r.assetstatus.toUpperCase() === "OPERATING"
//   ).length;

//   return (
//     <div className="pm-form-wrapper">

//       {/* CSV Upload */}
//       <div className="upload-area" onClick={() => fileRef.current?.click()}>
//         <input ref={fileRef} type="file" accept=".csv" hidden onChange={handleFileUpload} />
//         <span>Upload CSV</span>
//       </div>

//       {allRecords.length > 0 && (
//         <div className="stats">
//           <span>{allRecords.length} records</span>
//           <span>{uniqueByAlias.size} unique aliases</span>
//           <span>{activeCount} operating</span>
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>

//         {/* --- Identity --- */}
//         <fieldset>
//           <legend>Identity</legend>

//           <label>Alias
//             <select name="alias" value={selectedAlias} onChange={handleAliasSelect}>
//               <option value="__new__">+ New record</option>
//               {sortedAliases.map((alias) => {
//                 const r = uniqueByAlias.get(alias)!;
//                 return (
//                   <option key={alias} value={alias}>
//                     {r.alias} — {r.assetdescription}
//                   </option>
//                 );
//               })}
//             </select>
//           </label>

//           {isDirty && selectedAlias !== "__new__" && (
//             <p className="dirty-warning">⚠ Fields modified from loaded record</p>
//           )}

//           <label>PM number
//             <input name="pmnum" value={formData.pmnum} onChange={handleChange} placeholder="PM64356" />
//           </label>
//           <label>PM description
//             <input name="pmdescription" value={formData.pmdescription} onChange={handleChange} />
//           </label>
//           <label>Owner group
//             <input name="ownergroup" value={formData.ownergroup} onChange={handleChange} />
//           </label>
//           <label>CG division
//             <input name="cgdivision" value={formData.cgdivision} onChange={handleChange} />
//           </label>
//         </fieldset>

//         {/* --- Asset --- */}
//         <fieldset>
//           <legend>Asset</legend>

//           <label>Asset number
//             <input name="assetnum" value={formData.assetnum} onChange={handleChange} />
//           </label>
//           <label>Asset description
//             <input name="assetdescription" value={formData.assetdescription} onChange={handleChange} />
//           </label>
//           <label>Location description
//             <input name="locdescription" value={formData.locdescription} onChange={handleChange} />
//           </label>
//           <label>Asset status
//             <select name="assetstatus" value={formData.assetstatus} onChange={handleChange}>
//               <option value="OPERATING">OPERATING</option>
//               <option value="DECOMMISSIONED">DECOMMISSIONED</option>
//               <option value="IN REPAIR">IN REPAIR</option>
//             </select>
//           </label>
//           <label>PM status
//             <select name="pmstatus" value={formData.pmstatus} onChange={handleChange}>
//               <option value="ACTIVE">ACTIVE</option>
//               <option value="INACTIVE">INACTIVE</option>
//             </select>
//           </label>
//         </fieldset>

//         {/* --- Meter & Schedule --- */}
//         <fieldset>
//           <legend>Meter &amp; Schedule</legend>

//           <label>Meter name
//             <input name="metername" value={formData.metername} onChange={handleChange} />
//           </label>
//           <label>Last reading
//             <input name="lastreading" type="number" value={formData.lastreading} onChange={handleChange} />
//           </label>
//           <label>Next trigger
//             <input name="nexttrigger" type="number" value={formData.nexttrigger} onChange={handleChange} />
//           </label>
//           <label>Frequency
//             <input name="frequency" type="number" value={formData.frequency} onChange={handleChange} />
//           </label>
//           <label>Tolerance
//             <input name="tolerance" type="number" value={formData.tolerance} onChange={handleChange} />
//           </label>
//           <label>Units to go
//             <input name="unitstogo" type="number" value={formData.unitstogo} onChange={handleChange} />
//           </label>
//         </fieldset>

//         {/* --- Work Order --- */}
//         <fieldset>
//           <legend>Work Order</legend>

//           <label>WO number
//             <input name="wonum" value={formData.wonum} onChange={handleChange} />
//           </label>
//           <label>WO description
//             <input name="wodescription" value={formData.wodescription} onChange={handleChange} />
//           </label>
//           <label>Report date
//             <input name="reportdate" type="datetime-local" value={formData.reportdate} onChange={handleChange} />
//           </label>
//           <label>Last PM WO gen read
//             <input name="lastpmwogenread" type="number" value={formData.lastpmwogenread} onChange={handleChange} />
//           </label>
//           <label>JP description
//             <input name="jpdescription" value={formData.jpdescription} onChange={handleChange} />
//           </label>
//           <label>Current JP description
//             <input name="curjpdescription" value={formData.curjpdescription} onChange={handleChange} />
//           </label>
//           <label>Days late
//             <input name="dayslate" type="number" value={formData.dayslate} onChange={handleChange} />
//           </label>
//           <label>Units late
//             <input name="unitslate" type="number" value={formData.unitslate} onChange={handleChange} />
//           </label>
//         </fieldset>

//         <div className="form-actions">
//           <button type="submit">Save record</button>
//           <button type="button" onClick={handleClear}>Clear</button>
//         </div>

//       </form>
//     </div>
//   );
// }



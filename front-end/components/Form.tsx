/*

This componenet will allow the user to create a
form containing the infornmation of the specific
part that they have on file. Filling in all of 
the details required.

Tolerence for parts...



*/


interface FormProps {
  name: string | number;
  id: number;                 // unique crypto ID?
  age: Date;
  lastTimeWorkedOn: Date;
  busID?: number;             // optional
}

export default function Form({
  name,
  id,
  age,
  lastTimeWorkedOn,
  busID
}: FormProps) {
  return (
    <div>
      <p>Name: {name}</p>
      <p>ID: {id}</p>
      <p>Age: {age.toDateString()}</p>
      <p>Last Worked On: {lastTimeWorkedOn.toLocaleString()}</p>
      {busID && <p>Bus ID: {busID}</p>}
    </div>
  );
}
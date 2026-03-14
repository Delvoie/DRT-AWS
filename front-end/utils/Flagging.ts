


export interface FlaggingProps {
    busID: number;
    odometer: number;
    daysLate: Date;
    unitsLate: number;
    tolerance: number;
}
/* 

pmnum as unique ID indentifyer.

if (unitsLate < 0 + tolerance) {
    return flag;
}
 
ensure that default 

*/
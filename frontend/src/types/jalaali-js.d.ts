declare module "jalaali-js" {
  export interface GregorianDate {
    gy: number;
    gm: number;
    gd: number;
  }

  export interface JalaaliDate {
    jy: number;
    jm: number;
    jd: number;
  }

  export function toJalaali(gy: number, gm: number, gd: number): JalaaliDate;
  export function toGregorian(jy: number, jm: number, jd: number): GregorianDate;
  export function jalaaliMonthLength(jy: number, jm: number): number;

  const jalaali: {
    toJalaali: typeof toJalaali;
    toGregorian: typeof toGregorian;
    jalaaliMonthLength: typeof jalaaliMonthLength;
  };

  export default jalaali;
}

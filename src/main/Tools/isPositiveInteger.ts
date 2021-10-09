export default function (str: string): boolean {
  const n = Math.floor(Number(str));
  if (n !== Infinity && String(n) === str && n >= 0) {
    return true;
  } else {
    return false;
  }
}

export function sortStringsAsNumberReverse(a, b) {
	a = Number(a);
	b = Number(b);

	if (a > b)
	   return -1;
	if (a < b)
	  return 1;
	return 0;
}

import { helper as buildHelper } from '@ember/component/helper';

export function formatNumber(params/*, hash*/) {
	let [arg1, arg2] = params;
	if (arg1 === undefined || arg2 === undefined) {
		return undefined;
	}
	return arg1.toFixed(arg2);
}

export default buildHelper(formatNumber);

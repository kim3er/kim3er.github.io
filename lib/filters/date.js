import moment from 'moment';

export default function date(date, format = null) {
	return moment(date).format(format);
}

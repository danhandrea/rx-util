const Observable = require('rxjs').Observable;

const waterfall = series => {
	return Observable.defer(() => {
		var acc = series[0]();
		for (var i = 1, len = series.length; i < len; i++) {
			(function (func) {
				acc = acc.switchMap(x => func(x));
			}(series[i]));
		}
		return acc;
	});
};

const wrapTimeout = (item) => {
	return Observable.create(observer => {
		setTimeout(() => {
			console.log(`in\t${item.value}\t${new Date().getTime()}`);
			observer.next(item);
			observer.complete();
		}, 300);
	});
};

const add1 = (item) => {
	return wrapTimeout(Object.assign(item, { value: item.value + 1 })).delay(300);
};

const add1xTimes = (howMany) => {
	return Array(howMany).fill((item) => add1(item));
};

const multiply = (item, howManyTimes) => {
	return wrapTimeout(Object.assign(item, { value: item.value * howManyTimes })).delay(300);
};

const divide = (item, by) => {
	return wrapTimeout(Object.assign(item, { value: item.value / by })).delay(300);
};

const flow = [() => add1({ value: 0 })].concat(
	add1xTimes(2),
	item => multiply(item, 5),
	item => divide(item, 3),
	add1xTimes(4),
	item => multiply(item, 10)
);

const example = waterfall(flow);

console.log(`start\t0\t${new Date().getTime()}`);

var subscription = example.subscribe(
	val => console.log(`ou\t${val.value}\t${new Date().getTime()}`),
	(err) => console.error(err),
	() => {
		console.log(`finish\t\t${new Date().getTime()}`);
		subscription.unsubscribe();
	}
);


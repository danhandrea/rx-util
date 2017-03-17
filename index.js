const
	Observable = require('rxjs').Observable,
	Promise = require('es6-promise').Promise,
	fetch = require('node-fetch');

fetch.Promise = Promise;

class RxUtil {
	waterfall(series) {
		return Observable.defer(() => {
			var acc = series[0]();
			for (var i = 1, len = series.length; i < len; i++) {
				(function (func) {
					acc = acc.switchMap(x => func(x));
				}(series[i]));
			}
			return acc;
		});
	}

	timer(state, delay) {
		return Observable.create(observer => {
			setTimeout(() => {
				observer.next(state);
				observer.complete();
			}, delay);
		});
	}

	init(value) {
		return this.timer(Object.assign({}, value), 1);
	}

	defer(operation) {
		return this.timer(operation(), 1);
	}

	async(state, prop, obs) {
		return Observable.create(observer => {
			obs.subscribe(
				result => {
					if (!state[prop]) state[prop] = [];
					Object.assign(state, {
						[prop]: result
					});
					observer.next(state);
					observer.complete();
				},
				err => observer.error(err)
			)
		});
	}

	pass(state, observable) {
		return Observable.create(observer => {
			observable.subscribe(
				() => {
					console.log('pas finished');
					observer.next(state);
					observer.complete();
				}
			);
		});
	}

	let(state, fn) {
		fn();
		return Observable.of(state);
	}

	fetch(state, item, url, prop, htmlparser) {
		return Observable.create(observer => {
			fetch(url)
				.then(res => res.text())
				.then(body => htmlparser(body))
				.then((result) => {
					if (!item[prop]) item[prop] = [];

					if (Array.isArray(result)) {
						Object.assign(item, {
							[prop]: [...item[prop], ...result]
						});
					} else {
						Object.assign(item, result);
					}
					observer.next(state);
					observer.complete();
				}).catch(err => observer.error(err));
		});
	}
}

module.exports = new RxUtil();

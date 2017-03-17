const hd = require('./index');

const addUser = (state) => {
	return hd.let(state, () => {
		Object.assign(state, {
			User: {
				name: 'Dan'
			}
		});
	});
}

const actions = [].concat(
	state => hd.init({ foo: 'bar' }),
	state => addUser(state)
);

const subscriber = hd.waterfall(actions).subscribe(
	state => console.log(state),
	err => console.error(err),
	() => console.log(`finished`)
);
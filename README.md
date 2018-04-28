```js
const app = require('./index');

const debug = false;
const actions = ['inc', 'reset', 'log'];

function initializeState(actions) {
  return [
    {
      counter: 0
    },
    [() => Promise.resolve(actions.inc()), () => Promise.resolve(actions.log())]
  ];
}

function update(msg, state, actions) {
  switch (msg.type) {
    case actions.inc_type:
      const nextCounter = state.counter + 1;
      return [
        { ...state, counter: nextCounter },
        [
          state =>
            new Promise((resolve, reject) => {
              setTimeout(
                () =>
                  resolve(
                    state.counter >= 10
                      ? Promise.resolve(actions.reset())
                      : Promise.resolve(actions.inc())
                  ),
                1000
              );
            }),
          () => Promise.resolve(actions.log())
        ]
      ];

    case actions.reset_type:
      return [{ ...state, counter: 0 }, [() => Promise.resolve(actions.inc())]];

    case actions.log_type:
      console.log('Counter', state.counter);
      return [state];
  }

  return state;
}

function inspector(lifeCycleEvent, state, commands, msg) {
  debug && console.log(lifeCycleEvent, state, commands, msg);
}

app(actions, initializeState, update, inspector);
```

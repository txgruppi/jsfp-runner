const app = require('./index');

const debug = false;
const actions = ['inc', 'reset', 'log'];

function initializeState(actions) {
  return [
    {
      counter: 0
    },
    [async () => actions.inc()]
  ];
}

function update(msg, state, actions) {
  switch (msg.type) {
    case actions.inc_type:
      const nextCounter = state.counter + 1;
      return [
        { ...state, counter: nextCounter },
        [
          async () => actions.log(),
          async state =>
            setTimeout(
              () => (state.counter >= 10 ? actions.reset() : actions.inc()),
              1000
            )
        ]
      ];

    case actions.reset_type:
      return [{ ...state, counter: 0 }, [async () => actions.inc()]];

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

module.exports = app;
module.exports.logger = logger;

function isFunction(v) {
  return typeof v === 'function';
}

function createActions(actions, dispatch) {
  return actions.reduce((map, type) => {
    map[type] = payload => dispatch({ type, payload });
    map[`${type}_type`] = type;
    return map;
  }, {});
}

function app(actions, initializeState, update, inspector) {
  let current_command = null;
  let command_queue = [];
  const mappedActions = createActions(actions, dispatch);
  let [state, commands] = initializeState(mappedActions);
  queue_commands(commands);
  isFunction(inspector) &&
    inspector('create', state, command_queue, null, null);
  run_next_command_in_queue();
  return mappedActions;

  function queue_commands(commands) {
    if (Array.isArray(commands)) {
      command_queue = command_queue.concat(commands);
    }
  }

  function run_next_command_in_queue() {
    if (command_queue.length === 0 || current_command !== null) {
      return;
    }

    current_command = command_queue.shift();

    try {
      current_command(state)
        .then(() => {
          current_command = null;
          run_next_command_in_queue();
        })
        .catch(() => {
          current_command = null;
          run_next_command_in_queue();
        });
    } catch (e) {
      isFunction(inspector) &&
        inspector('create', state, command_queue, null, e);
      current_command = null;
      run_next_command_in_queue();
    }
  }

  function dispatch(msg) {
    isFunction(inspector) &&
      inspector('dispatch', state, command_queue, msg, null);
    [state, commands] = update(msg, state, mappedActions);
    queue_commands(commands);
    isFunction(inspector) &&
      inspector('update', state, command_queue, null, null);
    run_next_command_in_queue();
  }
}

function logger(lcevent, state, commands, msg, error) {
  console.log(lcevent, state, commands, msg, error);
}

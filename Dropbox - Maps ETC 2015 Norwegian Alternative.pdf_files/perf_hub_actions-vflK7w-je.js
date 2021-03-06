// Generated by CoffeeScript 1.10.0
define(['modules/clean/flux/dispatcher', 'modules/clean/devtools/perf_hub_action_types'], function(FilesDispatcher, arg) {
  var ActionTypes, PerfHubActions;
  ActionTypes = arg.ActionTypes;
  PerfHubActions = (function() {
    function PerfHubActions() {}

    PerfHubActions.prototype.add_ajax_profile = function(arg1) {
      var url, xhr;
      xhr = arg1.xhr, url = arg1.url;
      return FilesDispatcher.dispatch({
        type: ActionTypes.PROFILED_AJAX_LOAD_FINISHED,
        data: {
          xhr: xhr,
          url: url
        }
      });
    };

    PerfHubActions.prototype.add_web_timing_details = function(arg1) {
      var details;
      details = arg1.details;
      return FilesDispatcher.dispatch({
        type: ActionTypes.WEB_TIMING_FETCHED,
        data: {
          details: details
        }
      });
    };

    return PerfHubActions;

  })();
  return new PerfHubActions();
});

//# sourceMappingURL=perf_hub_actions.js.map

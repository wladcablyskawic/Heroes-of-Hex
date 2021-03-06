// Generated by CoffeeScript 1.10.0
define(['external/react', 'external/underscore'], function(React, $u) {
  var Hidden, HiddenSelect, ce, d;
  d = React.DOM;
  ce = React.createElement;
  Hidden = React.createClass({
    displayName: 'Hidden',
    render: function() {
      return d.div({
        hidden: true,
        style: {
          display: "none"
        }
      }, this.props.children);
    }
  });
  HiddenSelect = React.createClass({
    displayName: 'HiddenSelect',
    propTypes: {
      options: React.PropTypes.arrayOf(React.PropTypes.any).isRequired,
      value: React.PropTypes.any
    },
    render: function() {
      var optionValue;
      return ce(Hidden, {}, d.select($u.omit(this.props, 'options'), (function() {
        var i, len, ref, results;
        ref = this.props.options;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          optionValue = ref[i];
          results.push(d.option({
            key: optionValue,
            label: optionValue,
            value: optionValue
          }));
        }
        return results;
      }).call(this)));
    }
  });
  return {
    Hidden: Hidden,
    HiddenSelect: HiddenSelect
  };
});

//# sourceMappingURL=hidden.js.map

var pg = require('pg');

exports.hook_init_master = function(next, server) {
  var logerror = this.loginfo;
  var config = this.config.get('postgresql', 'json');
  server.notes.pg = new pg.Client(config.connectionString);
  server.notes.pg.connect(onConnect);

  function onConnect(err) {
    if(err) logerror(err);
    next(err);
  }
};
var format = require('util').format;

exports.hook_init_master = function(next, server) {

	var completed = 0;
	var mailbox_list = {}
	var pg = server.notes.pg;
	var host_list = server.notes.host_list;
	var query = 'SELECT id, name FROM "%s".mailbox';
	server.notes.mailbox_list = mailbox_list;

	for(var i=0; i<host_list.length; i++) {
		server.logdebug(format(query, host_list[i]));
		pg.query(format(query, host_list[i]), generateMailboxList(host_list[i]));
	}

  function generateMailboxList(host) {
		if(!mailbox_list[host]) mailbox_list[host] = {};

		return function(err, result) {
			if(err) {
				server.logdebug(err);
				return next(err);
			}

			var mailboxes = result.rows;
			for(var i=0; i < mailboxes.length; i++) {
				var mailbox = mailboxes[i];
				mailbox_list[host][mailbox.name] = mailbox.id;
			}

			generateComplete();
		}
  }

	function generateComplete() {
		if(++completed === host_list.length) {
			server.logdebug(JSON.stringify(mailbox_list));
			next();
		}
	}
}

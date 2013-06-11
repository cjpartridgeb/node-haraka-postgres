exports.hook_rcpt = function(next, connection, params) {
  var rcpt = params[0];
  if(!rcpt.host) return next();
	if(!rcpt.user) return next();

	var notes = connection.notes;
  var host = rcpt.host.toLowerCase();
	var user = rcpt.user.toLowerCase();
	var mailbox_list = connection.server.notes.mailbox_list;

	if(!notes.deliveries) notes.deliveries = {};

	if(mailbox_list[host] && mailbox_list[host][user]) {
		if(!notes.deliveries[host]) notes.deliveries[host] = [];
		notes.deliveries[host].push(mailbox_list[host][user]);
		return next(OK);
	}

	return next();
}


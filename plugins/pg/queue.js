var buffers = require('buffers');
var format = require('util').format;

var MSG_QRY = 'INSERT INTO "%s".message ("to", "from", subject, headers, content_type, body, parts) '
					  + 'VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id';

var ATTACH_QRY = 'INSERT INTO "%s".attachment '
						   + '(message_id, filename, content_type, data) '
						   + 'VALUES ($1, $2, $3, $4)';


exports.hook_queue = function(next, connection) {

	var pg = connection.server.notes.pg;
	var body = connection.transaction.body;
	var deliveries = connection.notes.deliveries;
	var attachments = connection.notes.attachments;

	var message = [];
	var delivered = 0;
	var hosts = Object.keys(deliveries);
	var headers = body.header.headers_decoded;

	var message = [
		headers['to'] ? headers['to'][0] : null,
		headers['from'] ? headers['from'][0] : null,
		headers['subject'] ? headers['subject'][0] : null,
		JSON.stringify(headers),
		body.ct,
		body.bodytext,
		JSON.stringify(extractChildren(body.children))
	];

	if(!hosts) return next();
	for(var i=0; i<hosts.length; i++) {
		pg.query(format(MSG_QRY, hosts[i]),	message,
			insertRecipients(hosts[i], deliveries[hosts[i]])
		);
	}

	function insertRecipients(host, mailboxes) {
		return function(err, result) {
			if(err) return insertComplete(err);
			var query = generateMailboxQuery(mailboxes);
			mailboxes.unshift(result.rows[0].id);
			pg.query(format(query, host), mailboxes, function(err) {
				if(err || !attachments.length) return insertComplete(err);
				insertAttachments(result.rows[0].id, host);
			});
		}
	}

	function insertAttachments(id, host) {
		var inserted = 0;

		for(var i=0; i<attachments.length; i++) {
			pg.query(format(ATTACH_QRY, host), [
				id,
				attachments[i].filename,
				attachments[i].content_type,
				attachments[i].data
			], attachmentInserted);
		}
	
		function attachmentInserted(err) {
			if(err) return insertComplete(err);
			if(++inserted === attachments.length) insertComplete();
		}
	}

	function insertComplete(err) {
		if(err) return next(DENY, 'Oops, an error occured in pg/queue' + JSON.stringify(err));
		if(++delivered === hosts.length) return next(OK);
	}
};

function generateMailboxQuery(mailboxes) {
	var base = 'INSERT INTO "%s".mailbox_message (message_id, mailbox_id) VALUES ';
	var values = [];
	for(var i=0; i<mailboxes.length; i++) {
		values.push(' ($1, $' + (i+2) + ')');
	}
	return base + values.join(', ');	
}

function extractChildren(children) {
  return children.map(function(child) {
    var data = {
      bodytext: child.bodytext,
      headers: child.header.headers_decoded
    }
    if (child.children.length > 0) data.children = extractChildren(child.children);
    return data;
  }) 
}

exports.hook_data = function(next, connection) {
	connection.transaction.parse_body = 1;
	connection.notes.attachments = [];
	connection.transaction.attachment_hooks(onAttachment(connection));
 	next();
}

function onAttachment(connection) {
	var transaction = connection.transaction;
	var notes = connection.notes;

	return function(content_type, filename, body, stream) {
		var start = new Date().getTime();
		var attachment = {};
		var bufs = buffers();
	
		attachment.filename = filename;
		attachment.content_type = content_type;

		stream.on('data', function(data) {
			bufs.push(data);
		});

		stream.on('end', function() {
			var b = bufs.toBuffer();
			attachment.data = b.toString('base64');
  		notes.attachments.push(attachment);
		});
	};
}
